import { fireEvent, render, screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';
import ProjectCard from './ProjectCard.vue';

const project = {
	id: 1,
	name: 'Slingshot',
	description: 'Desktop workspace',
	folderPath: '/projects/slingshot',
	launchUrl: 'https://localhost:1420',
	terminalCommand: 'pnpm dev',
};

describe('ProjectCard', () => {
	it('opens management without exposing settings controls', async () => {
		const view = render(ProjectCard, { props: { project } });

		expect(screen.queryByText('Edit URL')).not.toBeInTheDocument();
		expect(screen.queryByText('Edit command')).not.toBeInTheDocument();
		expect(screen.queryByText('Delete')).not.toBeInTheDocument();

		await fireEvent.click(screen.getByRole('button', { name: 'Manage Slingshot' }));

		expect(view.emitted().manage).toEqual([[project]]);
	});

	it('shows the launching state and disables the launch button', () => {
		render(ProjectCard, { props: { project, isLaunching: true } });

		const launchButton = screen.getByRole('button', { name: 'Launch Slingshot' });
		expect(launchButton).toHaveTextContent('Launching...');
		expect(launchButton).toBeDisabled();
	});

	it('emits a launch event when the workspace button is clicked', async () => {
		const view = render(ProjectCard, { props: { project } });

		await fireEvent.click(screen.getByRole('button', { name: 'Launch Slingshot' }));

		expect(view.emitted().launch).toEqual([[project]]);
	});
});
