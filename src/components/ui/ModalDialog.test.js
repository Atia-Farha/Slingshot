import { fireEvent, render, screen } from '@testing-library/vue';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { nextTick, ref } from 'vue';
import ModalDialog from './ModalDialog.vue';

describe('ModalDialog', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('closes when the backdrop is clicked', async () => {
		const view = render(ModalDialog, {
			props: { title: 'Confirm action' },
			slots: { default: '<p>Are you sure?</p>' },
		});

		await fireEvent.mouseDown(screen.getByRole('dialog', { hidden: true }).parentElement);

		expect(view.emitted().close).toHaveLength(1);
	});

	it('does not close when preventClose is true', async () => {
		const view = render(ModalDialog, {
			props: { title: 'Confirm action', preventClose: true },
			slots: { default: '<p>Are you sure?</p>' },
		});

		await fireEvent.mouseDown(screen.getByRole('dialog', { hidden: true }).parentElement);

		expect(view.emitted().close).toBeUndefined();
	});

	it('closes when the Escape key is pressed', async () => {
		const view = render(ModalDialog, {
			props: { title: 'Confirm action' },
			slots: { default: '<p>Are you sure?</p>' },
		});

		await fireEvent.keyDown(window, { key: 'Escape' });

		expect(view.emitted().close).toHaveLength(1);
	});

	it('does not close when Escape is pressed while preventClose is true', async () => {
		const view = render(ModalDialog, {
			props: { title: 'Confirm action', preventClose: true },
			slots: { default: '<p>Are you sure?</p>' },
		});

		await fireEvent.keyDown(window, { key: 'Escape' });

		expect(view.emitted().close).toBeUndefined();
	});

	it('does not close when a non-Escape key is pressed', async () => {
		const view = render(ModalDialog, {
			props: { title: 'Confirm action' },
			slots: { default: '<p>Are you sure?</p>' },
		});

		await fireEvent.keyDown(window, { key: 'Enter' });

		expect(view.emitted().close).toBeUndefined();
	});

	it('renders the description paragraph when provided', () => {
		render(ModalDialog, {
			props: { title: 'Confirm action', description: 'This cannot be undone.' },
			slots: { default: '<p>Are you sure?</p>' },
		});

		expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
	});

	it('omits the description paragraph when description is empty', () => {
		render(ModalDialog, {
			props: { title: 'Confirm action' },
			slots: { default: '<p>Are you sure?</p>' },
		});

		const header = document.body.querySelector('[role="dialog"] header');
		expect(header?.querySelector('p')).toBeNull();
	});

	it('wires the description paragraph to the dialog as the accessible description', () => {
		render(ModalDialog, {
			props: { title: 'Confirm action', description: 'This cannot be undone.' },
			slots: { default: '<p>Are you sure?</p>' },
		});

		const dialog = screen.getByRole('dialog', { hidden: true });
		const descriptionId = dialog.getAttribute('aria-describedby');
		expect(descriptionId).toBeTruthy();
		const describedBy = document.getElementById(descriptionId);
		expect(describedBy?.textContent?.trim()).toBe('This cannot be undone.');
	});

	it('does not set aria-describedby when no description is provided', () => {
		render(ModalDialog, {
			props: { title: 'Confirm action' },
			slots: { default: '<p>Are you sure?</p>' },
		});

		const dialog = screen.getByRole('dialog', { hidden: true });
		expect(dialog.hasAttribute('aria-describedby')).toBe(false);
	});

	it('locks body scroll on mount and restores it on unmount', async () => {
		document.body.style.overflow = 'auto';
		document.body.style.paddingRight = '';

		const view = render(ModalDialog, {
			props: { title: 'Confirm action' },
			slots: { default: '<button type="button">Confirm</button>' },
		});
		await nextTick();

		expect(document.body.style.overflow).toBe('hidden');

		view.unmount();
		expect(document.body.style.overflow).toBe('auto');
	});

	it('preserves the body padding-right offset to prevent layout shift when a scrollbar is present', async () => {
		document.body.style.overflow = 'auto';
		document.body.style.paddingRight = '';

		const originalInnerWidth = Object.getOwnPropertyDescriptor(window, 'innerWidth');
		const originalClientWidth = Object.getOwnPropertyDescriptor(document.documentElement, 'clientWidth');
		Object.defineProperty(window, 'innerWidth', { configurable: true, get: () => 1000 });
		Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, get: () => 985 });

		const view = render(ModalDialog, {
			props: { title: 'Confirm action' },
			slots: { default: '<button type="button">Confirm</button>' },
		});
		await nextTick();

		expect(document.body.style.overflow).toBe('hidden');
		expect(document.body.style.paddingRight).toBe('15px');

		view.unmount();

		if (originalInnerWidth) {
			Object.defineProperty(window, 'innerWidth', originalInnerWidth);
		}
		if (originalClientWidth) {
			Object.defineProperty(document.documentElement, 'clientWidth', originalClientWidth);
		}
		expect(document.body.style.overflow).toBe('auto');
		expect(document.body.style.paddingRight).toBe('');
	});

	it('does not adjust body padding-right when there is no scrollbar', async () => {
		document.body.style.overflow = 'auto';
		document.body.style.paddingRight = '7px';

		const originalInnerWidth = Object.getOwnPropertyDescriptor(window, 'innerWidth');
		const originalClientWidth = Object.getOwnPropertyDescriptor(document.documentElement, 'clientWidth');
		Object.defineProperty(window, 'innerWidth', { configurable: true, get: () => 1000 });
		Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, get: () => 1000 });

		const view = render(ModalDialog, {
			props: { title: 'Confirm action' },
			slots: { default: '<button type="button">Confirm</button>' },
		});
		await nextTick();

		expect(document.body.style.overflow).toBe('hidden');
		expect(document.body.style.paddingRight).toBe('7px');

		view.unmount();

		if (originalInnerWidth) {
			Object.defineProperty(window, 'innerWidth', originalInnerWidth);
		}
		if (originalClientWidth) {
			Object.defineProperty(document.documentElement, 'clientWidth', originalClientWidth);
		}
		expect(document.body.style.overflow).toBe('auto');
		expect(document.body.style.paddingRight).toBe('7px');
	});

	describe('focus trap', () => {
		beforeEach(() => {
			document.body.innerHTML = '<button id="opener">Open dialog</button>';
		});

		it('focuses the first focusable child on mount', async () => {
			render(ModalDialog, {
				props: { title: 'Confirm action' },
				slots: {
					default: `
						<input type="text" name="first" />
						<button type="button">Confirm</button>
					`,
				},
			});
			await nextTick();
			const firstInput = screen.getByRole('textbox');
			expect(document.activeElement).toBe(firstInput);
		});

		it('wraps focus from the last focusable to the first on Tab', async () => {
			render(ModalDialog, {
				props: { title: 'Confirm action' },
				slots: {
					default: `
						<input type="text" name="first" />
						<button type="button">Confirm</button>
					`,
				},
			});
			await nextTick();
			const confirm = screen.getByRole('button', { name: 'Confirm' });
			confirm.focus();
			expect(document.activeElement).toBe(confirm);

			await fireEvent.keyDown(window, { key: 'Tab' });
			expect(document.activeElement).toBe(screen.getByRole('textbox'));
		});

		it('wraps focus from the first focusable to the last on Shift+Tab', async () => {
			render(ModalDialog, {
				props: { title: 'Confirm action' },
				slots: {
					default: `
						<input type="text" name="first" />
						<button type="button">Confirm</button>
					`,
				},
			});
			await nextTick();
			const first = screen.getByRole('textbox');
			first.focus();
			expect(document.activeElement).toBe(first);

			await fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
			expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Confirm' }));
		});

		it('does not wrap when Tab is pressed from a middle focusable', async () => {
			render(ModalDialog, {
				props: { title: 'Confirm action' },
				slots: {
					default: `
						<input type="text" placeholder="first" />
						<input type="text" placeholder="middle" />
						<button type="button">Confirm</button>
					`,
				},
			});
			await nextTick();
			const middle = document.body.querySelector('input[placeholder="middle"]');
			middle.focus();
			expect(document.activeElement).toBe(middle);

			await fireEvent.keyDown(window, { key: 'Tab' });

			expect(document.activeElement).toBe(middle);
		});

		it('falls back to the first focusable element on mount when there is no input/textarea/button/anchor', async () => {
			render(ModalDialog, {
				props: { title: 'Confirm action' },
				slots: { default: '<div>Plain content, no controls</div>' },
			});
			await nextTick();
			expect(document.activeElement === document.body || document.activeElement?.id === 'opener').toBe(true);
		});

		it('preventDefaults Tab when the panel has no focusable elements', async () => {
			render(ModalDialog, {
				props: { title: 'Confirm action' },
				slots: { default: '<div>No focusable content</div>' },
			});
			await nextTick();
			const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
			window.dispatchEvent(event);
			expect(event.defaultPrevented).toBe(true);
		});

		it('restores focus to the previously focused element on unmount', async () => {
			const opener = document.getElementById('opener');
			opener.focus();
			expect(document.activeElement).toBe(opener);

			const view = render(ModalDialog, {
				props: { title: 'Confirm action' },
				slots: { default: '<button type="button">Confirm</button>' },
			});
			await nextTick();

			view.unmount();
			expect(document.activeElement).toBe(opener);
		});

		it('does not throw when unmounting without a previously focused element', async () => {
			document.body.innerHTML = '';
			const view = render(ModalDialog, {
				props: { title: 'Confirm action' },
				slots: { default: '<button type="button">Confirm</button>' },
			});
			await nextTick();
			expect(() => view.unmount()).not.toThrow();
		});

		it('does not throw when unmounting and the previously focused element has no focus() method', async () => {
			const fake = document.createElement('span');
			fake.id = 'opener';
			fake.tabIndex = 0;
			document.body.innerHTML = '';
			document.body.appendChild(fake);
			fake.focus();
			expect(document.activeElement).toBe(fake);
			Object.defineProperty(fake, 'focus', { value: undefined, configurable: true });

			const view = render(ModalDialog, {
				props: { title: 'Confirm action' },
				slots: { default: '<button type="button">Confirm</button>' },
			});
			await nextTick();
			expect(() => view.unmount()).not.toThrow();
		});

		it('does not try to restore focus when the previously focused element has been removed from the DOM', async () => {
			const opener = document.getElementById('opener');
			opener.focus();
			expect(document.activeElement).toBe(opener);

			const view = render(ModalDialog, {
				props: { title: 'Confirm action' },
				slots: { default: '<button type="button">Confirm</button>' },
			});
			await nextTick();

			opener.remove();

			expect(() => view.unmount()).not.toThrow();
		});

		it('returns an empty focusable list when the panel ref is null', async () => {
			let focusableGetter = null;
			let panelSetter = null;

			const ExposeStub = {
				components: { ModalDialog },
				template: '<ModalDialog ref="modal" :title="title" />',
				props: { title: { type: String, required: true } },
				setup() {
					const modal = ref(null);
					return { modal };
				},
				mounted() {
					focusableGetter = () => this.modal._focusableElements();
					panelSetter = () => this.modal._setPanelForTest(null);
				},
			};

			render(ExposeStub, { props: { title: 'Confirm action' } });
			await nextTick();

			panelSetter();
			expect(focusableGetter()).toEqual([]);
		});
	});

	describe('SSR guards', () => {
		let getScrollbarWidth = null;
		let lockBodyScroll = null;
		let unlockBodyScroll = null;

		const ExposeStub = {
			components: { ModalDialog },
			template: '<ModalDialog ref="modal" :title="title" />',
			props: { title: { type: String, required: true } },
			setup() {
				const modal = ref(null);
				return { modal };
			},
			mounted() {
				getScrollbarWidth = () => this.modal._getScrollbarWidthForTest();
				lockBodyScroll = () => this.modal._lockBodyScrollForTest();
				unlockBodyScroll = () => this.modal._unlockBodyScrollForTest();
			},
		};

		function withGlobalHidden(name, fn) {
			const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
			Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: undefined });
			try {
				fn();
			} finally {
				if (descriptor) {
					Object.defineProperty(globalThis, name, descriptor);
				} else {
					delete globalThis[name];
				}
			}
		}

		beforeEach(() => {
			render(ExposeStub, { props: { title: 'Confirm action' } });
		});

		it('returns 0 from getScrollbarWidth when window is undefined', () => {
			expect(typeof getScrollbarWidth).toBe('function');
			withGlobalHidden('window', () => {
				expect(getScrollbarWidth()).toBe(0);
			});
		});

		it('is a no-op when lockBodyScroll is called without document', () => {
			expect(typeof lockBodyScroll).toBe('function');
			document.body.style.overflow = 'auto';
			document.body.style.paddingRight = '';
			withGlobalHidden('document', () => {
				expect(() => lockBodyScroll()).not.toThrow();
			});
			expect(document.body.style.overflow).toBe('auto');
			expect(document.body.style.paddingRight).toBe('');
		});

		it('is a no-op when unlockBodyScroll is called without document', () => {
			expect(typeof unlockBodyScroll).toBe('function');
			document.body.style.overflow = 'hidden';
			document.body.style.paddingRight = '5px';
			withGlobalHidden('document', () => {
				expect(() => unlockBodyScroll()).not.toThrow();
			});
			expect(document.body.style.overflow).toBe('hidden');
			expect(document.body.style.paddingRight).toBe('5px');
		});
	});
});
