import { render, waitFor } from '@testing-library/vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
	const terminalInstances = [];
	let latestStartCallbacks = null;
	let resizeCallback = null;

	class Terminal {
		constructor() {
			this.cols = 80;
			this.rows = 24;
			this.open = vi.fn();
			this.write = vi.fn();
			this.writeln = vi.fn();
			this.dispose = vi.fn();
			this.focus = vi.fn();
			this.loadAddon = vi.fn();
			this._dataHandlers = [];
			this.onData = vi.fn((handler) => {
				this._dataHandlers.push(handler);
				return {
					dispose: vi.fn(() => {
						this._dataHandlers = this._dataHandlers.filter((h) => h !== handler);
					}),
				};
			});
			this._emitData = (data) => {
				this._dataHandlers.forEach((h) => h(data));
			};
			terminalInstances.push(this);
		}
	}
	class FitAddon {
		fit = vi.fn();
	}
	class MockResizeObserver {
		observe = vi.fn();
		disconnect = vi.fn();
		unobserve = vi.fn();
		constructor(callback) {
			resizeCallback = callback;
		}
	}

	const startTerminal = vi.fn();
	startTerminal._reset = () => {
		latestStartCallbacks = null;
		startTerminal.mockReset();
		startTerminal.mockImplementation((_project, _dims, callbacks) => {
			latestStartCallbacks = callbacks;
			return Promise.resolve({ sessionId: 42, channels: [{ id: 'onData' }, { id: 'onExit' }] });
		});
	};
	startTerminal._setImplementation = (impl) => {
		startTerminal.mockImplementation((project, dims, callbacks) => {
			latestStartCallbacks = callbacks;
			return impl(project, dims, callbacks);
		});
	};
	startTerminal._reset();

	return {
		terminalInstances,
		getLatestStartCallbacks: () => latestStartCallbacks,
		getResizeCallback: () => resizeCallback,
		resetResizeCallback: () => {
			resizeCallback = null;
		},
		Terminal,
		FitAddon,
		MockResizeObserver,
		startTerminal,
		writeTerminal: vi.fn().mockResolvedValue(undefined),
		resizeTerminal: vi.fn().mockResolvedValue(undefined),
		stopTerminal: vi.fn().mockResolvedValue(undefined),
	};
});

vi.mock('@xterm/xterm', () => ({ Terminal: mocks.Terminal }));
vi.mock('@xterm/addon-fit', () => ({ FitAddon: mocks.FitAddon }));
vi.mock('@xterm/xterm/css/xterm.css', () => ({}));

if (typeof globalThis.ResizeObserver === 'undefined') {
	globalThis.ResizeObserver = mocks.MockResizeObserver;
}

vi.mock('../../../services/terminalClient', () => ({
	startTerminal: mocks.startTerminal,
	writeTerminal: mocks.writeTerminal,
	resizeTerminal: mocks.resizeTerminal,
	stopTerminal: mocks.stopTerminal,
}));

import TerminalPane from './TerminalPane.vue';

const project = {
	id: 1,
	name: 'Slingshot',
	folderPath: '/projects/slingshot',
	terminalCommand: 'pnpm dev',
};

function renderWithExpose() {
	let paneRef = null;
	const Wrapper = {
		components: { TerminalPane },
		template: '<TerminalPane ref="pane" @error="onError" />',
		emits: ['error'],
		methods: {
			onError(msg) {
				this.$emit('error', msg);
			},
		},
		mounted() {
			paneRef = this.$refs.pane;
		},
	};
	const view = render(Wrapper);
	return { view, getPane: () => paneRef };
}

function findStatusBadge(view) {
	const base = view.baseElement ?? view.container;
	if (!base) return null;
	const spans = base.querySelectorAll('span');
	for (const span of spans) {
		const text = span.textContent?.trim();
		if (['idle', 'starting', 'running', 'stopping', 'stopped', 'exited', 'error'].includes(text)) {
			return text;
		}
	}
	return null;
}

beforeEach(() => {
	mocks.writeTerminal.mockReset().mockResolvedValue(undefined);
	mocks.resizeTerminal.mockReset().mockResolvedValue(undefined);
	mocks.stopTerminal.mockReset().mockResolvedValue(undefined);
	mocks.terminalInstances.length = 0;
	mocks.resetResizeCallback();
	mocks.startTerminal._reset();
});

describe('TerminalPane', () => {
	it('starts a terminal session and reports running status', async () => {
		const { getPane } = renderWithExpose();
		const sessionId = await getPane().start(project);

		expect(sessionId).toBe(42);
		expect(mocks.startTerminal).toHaveBeenCalledWith(project, expect.objectContaining({ cols: expect.any(Number), rows: expect.any(Number) }), expect.objectContaining({ onData: expect.any(Function), onExit: expect.any(Function) }));
		expect(mocks.terminalInstances[0].writeln).toHaveBeenCalledWith(expect.stringContaining('pnpm dev'));
		expect(mocks.terminalInstances[0].focus).toHaveBeenCalled();
	});

	it('stops the previous terminal session when starting a new one', async () => {
		mocks.startTerminal._setImplementation(() => {
			// First call returns sessionId 1, second returns 2.
			const callCount = mocks.startTerminal.mock.calls.length;
			return Promise.resolve({ sessionId: callCount, channels: [{}, {}] });
		});

		const { getPane } = renderWithExpose();
		await getPane().start(project);
		await getPane().start({ ...project, terminalCommand: 'pnpm build' });

		expect(mocks.stopTerminal).toHaveBeenCalledWith(1);
	});

	it('marks the terminal as errored and rethrows when startTerminal rejects', async () => {
		mocks.startTerminal._setImplementation(() => Promise.reject(new Error('PTY failed to start.')));

		const { getPane, view } = renderWithExpose();
		await expect(getPane().start(project)).rejects.toThrow('PTY failed to start.');

		await waitFor(() => {
			expect(mocks.terminalInstances[0].writeln).toHaveBeenCalledWith(expect.stringContaining('PTY failed to start.'));
		});
		expect(findStatusBadge(view)).toBe('error');
	});

	it('disposes the previous terminal when closed', async () => {
		const { getPane } = renderWithExpose();
		await getPane().start(project);
		await getPane().close();

		expect(mocks.terminalInstances[0].dispose).toHaveBeenCalled();
	});

	it('emits an error when stop rejects', async () => {
		mocks.stopTerminal.mockReset();
		mocks.stopTerminal.mockRejectedValue(new Error('Process not found.'));

		const { getPane, view } = renderWithExpose();
		await getPane().start(project);
		await getPane().stop();

		expect(view.emitted('error').flat()).toContain('Process not found.');
	});

	it('forwards terminal input to writeTerminal once a session is active', async () => {
		const { getPane } = renderWithExpose();
		const sessionId = await getPane().start(project);
		expect(sessionId).toBe(42);

		// Simulate user keystrokes reaching the terminal pane (incoming data via xterm onData).
		mocks.terminalInstances[0]._emitData('ls\n');
		await new Promise((r) => setTimeout(r, 0));
		expect(mocks.writeTerminal).toHaveBeenCalledWith(42, 'ls\n');
	});

	it('writes an ArrayBuffer as a Uint8Array to the terminal', async () => {
		const { getPane } = renderWithExpose();
		await getPane().start(project);

		const callbacks = mocks.getLatestStartCallbacks();
		expect(callbacks).toBeTruthy();
		const buffer = new ArrayBuffer(3);
		new Uint8Array(buffer).set([65, 66, 67]);
		callbacks.onData(buffer);

		await waitFor(() => {
			const last = mocks.terminalInstances[0].write.mock.calls.at(-1)?.[0];
			expect(last).toBeInstanceOf(Uint8Array);
			expect(Array.from(last)).toEqual([65, 66, 67]);
		});
	});

	it('writes a TypedArray as a Uint8Array view to the terminal', async () => {
		const { getPane } = renderWithExpose();
		await getPane().start(project);

		const callbacks = mocks.getLatestStartCallbacks();
		const view = new Uint8Array([68, 69, 70]);
		callbacks.onData(view);

		await waitFor(() => {
			const last = mocks.terminalInstances[0].write.mock.calls.at(-1)?.[0];
			expect(last).toBeInstanceOf(Uint8Array);
			expect(Array.from(last)).toEqual([68, 69, 70]);
		});
	});

	it('writes a plain array of bytes as a Uint8Array to the terminal', async () => {
		const { getPane } = renderWithExpose();
		await getPane().start(project);

		const callbacks = mocks.getLatestStartCallbacks();
		callbacks.onData([71, 72, 73]);

		await waitFor(() => {
			const last = mocks.terminalInstances[0].write.mock.calls.at(-1)?.[0];
			expect(last).toBeInstanceOf(Uint8Array);
			expect(Array.from(last)).toEqual([71, 72, 73]);
		});
	});

	it('schedules a fit and resizes the terminal when the element resizes', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'queueMicrotask', 'requestAnimationFrame', 'cancelAnimationFrame'] });
		try {
			const { getPane } = renderWithExpose();
			await getPane().start(project);

			// The component should have created a ResizeObserver, capturing the callback.
			const resizeCallback = mocks.getResizeCallback();
			expect(resizeCallback).toBeTruthy();

			// Fire a resize. The callback runs scheduleFit, which cancels any existing rAF
			// and schedules a new one.
			resizeCallback([{ target: {} }]);
			// Advance rAF to flush scheduleFit.
			vi.advanceTimersByTime(16);

			// resizeTerminal should now have been called with the session id and dimensions.
			await waitFor(() => {
				expect(mocks.resizeTerminal).toHaveBeenCalledWith(42, expect.objectContaining({ cols: expect.any(Number), rows: expect.any(Number) }));
			});
		} finally {
			vi.useRealTimers();
		}
	});

	it('stops the previous session when a second start races in mid-flight', async () => {
		let resolveFirst;
		const firstDeferred = new Promise((resolve) => {
			resolveFirst = resolve;
		});
		// First call: defer. Second call resolves immediately.
		let callCount = 0;
		mocks.startTerminal._setImplementation(() => {
			callCount += 1;
			if (callCount === 1) {
				return firstDeferred;
			}
			return Promise.resolve({ sessionId: 2, channels: [{}, {}] });
		});

		const { getPane } = renderWithExpose();
		const firstStart = getPane().start(project);
		const secondStart = getPane().start({ ...project, terminalCommand: 'pnpm build' });

		// Resolve the first start's deferred with sessionId 1.
		resolveFirst({ sessionId: 1, channels: [{}, {}] });

		const firstResult = await firstStart;
		const secondResult = await secondStart;

		expect(firstResult).toBeNull();
		expect(secondResult).toBe(2);
		expect(mocks.stopTerminal).toHaveBeenCalledWith(1);
	});

	it('marks the session as exited and returns the session id when the process exits during start', async () => {
		mocks.startTerminal._setImplementation((_p, _d, callbacks) => {
			// Fire onExit synchronously before startTerminal returns.
			callbacks.onExit(0);
			return Promise.resolve({ sessionId: 5, channels: [{}, {}] });
		});

		const { getPane, view } = renderWithExpose();
		const sessionId = await getPane().start(project);

		expect(sessionId).toBe(5);
		await waitFor(() => {
			expect(findStatusBadge(view)).toBe('exited');
		});
	});

	it('scheduleFit no-ops when the terminal has been disposed', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'queueMicrotask', 'requestAnimationFrame', 'cancelAnimationFrame'] });
		try {
			const { getPane } = renderWithExpose();
			await getPane().start(project);
			await getPane().close();

			// After close(), terminal is undefined. Firing resize should not throw.
			const resizeCallback = mocks.getResizeCallback();
			expect(() => resizeCallback([{ target: {} }])).not.toThrow();
			vi.advanceTimersByTime(16);
		} finally {
			vi.useRealTimers();
		}
	});

	it('ignores stale onExit callbacks from previous sessions', async () => {
		let fireFirstExit;
		const firstDeferred = new Promise((resolve) => {
			fireFirstExit = (code) => {
				firstCallbacks?.onExit(code);
				resolve({ sessionId: 7, channels: [{}, {}] });
			};
		});
		let firstCallbacks = null;
		let callCount = 0;
		mocks.startTerminal._setImplementation((_p, _d, callbacks) => {
			callCount += 1;
			if (callCount === 1) {
				firstCallbacks = callbacks;
				return firstDeferred;
			}
			return Promise.resolve({ sessionId: 8, channels: [{}, {}] });
		});

		const { getPane } = renderWithExpose();
		const firstStart = getPane().start(project);

		// Trigger a second start, bumping generation.
		const secondResult = await getPane().start({ ...project, terminalCommand: 'pnpm build' });
		expect(secondResult).toBe(8);

		// Capture the live terminal BEFORE firing the stale onExit.
		const liveTerminal = mocks.terminalInstances[mocks.terminalInstances.length - 1];

		// Fire the FIRST session's onExit AFTER the generation bump.
		// Its `terminal` closure reference is the (now disposed) first Terminal instance,
		// but the source short-circuits on `generation !== startGeneration` (1 !== 2),
		// so the stale onExit should NOT write to the live terminal.
		fireFirstExit(1);

		await firstStart; // returns null due to stale generation

		const liveCallArgs = liveTerminal.writeln.mock.calls.flat().join('\n');
		expect(liveCallArgs).not.toContain('[process exited with code 1]');
	});

	it('emits an error when writeTerminal rejects from input data', async () => {
		mocks.writeTerminal.mockReset();
		mocks.writeTerminal.mockRejectedValue(new Error('Pipe closed.'));

		const { getPane, view } = renderWithExpose();
		await getPane().start(project);

		// Drive the xterm onData callback with input data.
		mocks.terminalInstances[0]._emitData('ls\n');

		await waitFor(() => {
			expect(view.emitted('error').flat()).toContain('Pipe closed.');
		});
	});

	it('emits an error when resizeTerminal rejects during a fit', async () => {
		mocks.resizeTerminal.mockReset();
		mocks.resizeTerminal.mockRejectedValue(new Error('Resize failed.'));

		vi.useFakeTimers({ toFake: ['setTimeout', 'queueMicrotask', 'requestAnimationFrame', 'cancelAnimationFrame'] });
		try {
			const { getPane, view } = renderWithExpose();
			await getPane().start(project);

			const resizeCallback = mocks.getResizeCallback();
			expect(resizeCallback).toBeTruthy();
			resizeCallback([{ target: {} }]);
			vi.advanceTimersByTime(16);

			await waitFor(() => {
				expect(view.emitted('error').flat()).toContain('Resize failed.');
			});
		} finally {
			vi.useRealTimers();
		}
	});

	it('swallows stopTerminal rejections when stopping the previous session', async () => {
		mocks.stopTerminal.mockRejectedValueOnce(new Error('Previous session crashed.'));

		const { getPane } = renderWithExpose();
		await getPane().start(project);

		// Starting a second session should not throw, even though stopping the
		// first one rejects.
		await expect(getPane().start({ ...project, terminalCommand: 'pnpm build' })).resolves.toBeTruthy();
	});

	it('swallows stopTerminal rejections when cleaning up a stale session after a race', async () => {
		// The cleanup stopTerminal call after a generation race should be caught
		// even if it rejects.
		mocks.stopTerminal.mockRejectedValueOnce(new Error('Race lost.'));

		let resolveFirst;
		const firstDeferred = new Promise((resolve) => {
			resolveFirst = resolve;
		});
		let callCount = 0;
		mocks.startTerminal._setImplementation(() => {
			callCount += 1;
			if (callCount === 1) {
				return firstDeferred;
			}
			return Promise.resolve({ sessionId: 2, channels: [{}, {}] });
		});

		const { getPane } = renderWithExpose();
		const firstStart = getPane().start(project);
		const secondStart = getPane().start({ ...project, terminalCommand: 'pnpm build' });

		resolveFirst({ sessionId: 1, channels: [{}, {}] });
		await expect(firstStart).resolves.toBeNull();
		await expect(secondStart).resolves.toBe(2);
		// Allow the rejected stopTerminal to be caught.
		await new Promise((r) => setTimeout(r, 0));
		expect(mocks.stopTerminal).toHaveBeenCalledWith(1);
	});

	it('swallows stopTerminal rejections during unmount', async () => {
		mocks.stopTerminal.mockRejectedValue(new Error('Process not found.'));

		const { getPane, view } = renderWithExpose();
		await getPane().start(project);

		// Force unmount — this triggers onBeforeUnmount, which calls stopTerminal.
		view.unmount();

		// Give the rejected promise a chance to be caught.
		await new Promise((r) => setTimeout(r, 0));
		expect(mocks.stopTerminal).toHaveBeenCalled();
	});

	it('ignores stale onData callbacks from previous sessions', async () => {
		let fireFirstData;
		const firstDeferred = new Promise((resolve) => {
			fireFirstData = (data) => {
				firstCallbacks?.onData(data);
				resolve({ sessionId: 7, channels: [{}, {}] });
			};
		});
		let firstCallbacks = null;
		let callCount = 0;
		mocks.startTerminal._setImplementation((_p, _d, callbacks) => {
			callCount += 1;
			if (callCount === 1) {
				firstCallbacks = callbacks;
				return firstDeferred;
			}
			return Promise.resolve({ sessionId: 8, channels: [{}, {}] });
		});

		const { getPane } = renderWithExpose();
		const firstStart = getPane().start(project);
		const secondResult = await getPane().start({ ...project, terminalCommand: 'pnpm build' });
		expect(secondResult).toBe(8);

		// Capture the live terminal BEFORE firing the stale onData.
		const liveTerminal = mocks.terminalInstances[mocks.terminalInstances.length - 1];
		const writeCallsBefore = liveTerminal.write.mock.calls.length;

		// Fire the FIRST session's onData AFTER the generation bump. The first session's
		// onData short-circuits on `generation !== startGeneration` (1 !== 2), so the
		// stale data should NOT be written to the live terminal.
		fireFirstData('stale-data');

		await firstStart;

		expect(liveTerminal.write.mock.calls.length).toBe(writeCallsBefore);
	});

	it('skips the resize IPC when the session is not yet active', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'queueMicrotask', 'requestAnimationFrame', 'cancelAnimationFrame'] });
		try {
			// Defer the first start so sessionId stays undefined while the resize fires.
			let resolveStart;
			const startDeferred = new Promise((resolve) => {
				resolveStart = resolve;
			});
			mocks.startTerminal._setImplementation(() => startDeferred);

			const { getPane } = renderWithExpose();
			const startPromise = getPane().start(project);

			// Allow createTerminal to run (it happens after nextTick inside start).
			await vi.advanceTimersByTimeAsync(0);

			// The ResizeObserver is now registered.
			const resizeCallback = mocks.getResizeCallback();
			expect(resizeCallback).toBeTruthy();

			// Fire a resize while sessionId is still undefined.
			resizeCallback([{ target: {} }]);
			vi.advanceTimersByTime(16);

			// resizeTerminal should NOT have been called — sessionId is undefined.
			expect(mocks.resizeTerminal).not.toHaveBeenCalled();

			// Now resolve start so the test can complete cleanly.
			resolveStart({ sessionId: 99, channels: [{}, {}] });
			await startPromise;
		} finally {
			vi.useRealTimers();
		}
	});

	it('skips the error writeln when the start generation has been bumped', async () => {
		// Configure startTerminal to defer the second call so we can bump the
		// generation BEFORE the rejection fires.
		let rejectSecond;
		const secondDeferred = new Promise((resolve, reject) => {
			rejectSecond = reject;
		});
		let callCount = 0;
		mocks.startTerminal._setImplementation(() => {
			callCount += 1;
			if (callCount === 1) {
				return Promise.resolve({ sessionId: 1, channels: [{}, {}] });
			}
			return secondDeferred;
		});

		const { getPane } = renderWithExpose();
		await getPane().start(project);

		// Start the failing session. Catch its rejection so vitest doesn't see an
		// unhandled error. The generation is 1 at this point.
		const secondStart = getPane().start({ ...project, terminalCommand: 'pnpm build' });
		// Bump the generation by calling stop() (which increments generation).
		await getPane().stop();

		// Now reject the second start — its startGeneration=1, but current
		// generation=2, so the catch block should NOT write the error to the terminal.
		rejectSecond(new Error('PTY failed to start.'));

		try {
			await secondStart;
		} catch {
			// Expected.
		}

		// The second start's failure should NOT have written an error message.
		const allWriteln = mocks.terminalInstances
			.flatMap((t) => t.writeln.mock.calls)
			.flat()
			.join('\n');
		expect(allWriteln).not.toContain('PTY failed to start.');
	});

	it('is a no-op when stop is called with no active session', async () => {
		const { getPane } = renderWithExpose();
		// No start has been called, so sessionId is undefined.
		// stop() should not throw and should not call stopTerminal.
		await expect(getPane().stop()).resolves.toBeUndefined();
		expect(mocks.stopTerminal).not.toHaveBeenCalled();
	});

	it('does not write input data through writeTerminal when no session is active', async () => {
		// Defer the start so we can emit data on the xterm handler BEFORE the
		// sessionId is assigned. The handler's `if (sessionId)` should be false.
		let resolveStart;
		const startDeferred = new Promise((resolve) => {
			resolveStart = resolve;
		});
		mocks.startTerminal._setImplementation(() => startDeferred);

		const { getPane } = renderWithExpose();
		const startPromise = getPane().start(project);

		// Yield so createTerminal() runs and the onData handler is registered.
		await new Promise((r) => setTimeout(r, 0));

		// At this point sessionId is still undefined. Emit data through xterm —
		// the handler's `if (sessionId)` should be false, so writeTerminal
		// is NOT called.
		mocks.terminalInstances[0]._emitData('pre-start\n');
		expect(mocks.writeTerminal).not.toHaveBeenCalled();

		// Now complete the start.
		resolveStart({ sessionId: 50, channels: [{}, {}] });
		await startPromise;
	});

	it('falls back to default dimensions when the terminal reports no size', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'queueMicrotask', 'requestAnimationFrame', 'cancelAnimationFrame'] });
		try {
			const { getPane } = renderWithExpose();
			await getPane().start(project);

			// Force the terminal instance to report undefined dimensions.
			// The ?? 80 / ?? 24 fallbacks should kick in when terminalDimensions() runs.
			const liveTerminal = mocks.terminalInstances[mocks.terminalInstances.length - 1];
			liveTerminal.cols = undefined;
			liveTerminal.rows = undefined;

			const resizeCallback = mocks.getResizeCallback();
			expect(resizeCallback).toBeTruthy();
			resizeCallback([{ target: {} }]);
			vi.advanceTimersByTime(16);

			await waitFor(() => {
				expect(mocks.resizeTerminal).toHaveBeenCalledWith(42, expect.objectContaining({ cols: 80, rows: 24 }));
			});
		} finally {
			vi.useRealTimers();
		}
	});
});
