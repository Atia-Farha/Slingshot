<script setup>
import rawMd from '~/legal/license.md?raw';
import { useMarkdown } from '~/composables/useMarkdown';

const {
	public: { siteUrl },
} = useRuntimeConfig();

const lastUpdated = 'July 17, 2026';
const { html } = useMarkdown(rawMd, { date: lastUpdated });

useSeoMeta({
	title: 'License | Slingshot',
	description: 'Human-readable summary of the Slingshot license (AGPL v3).',
	ogTitle: 'License — Slingshot',
	ogDescription: 'Human-readable summary of the Slingshot license (AGPL v3).',
	ogUrl: `${siteUrl}/license`,
	twitterTitle: 'License — Slingshot',
	twitterDescription: 'Human-readable summary of the Slingshot license (AGPL v3).',
	canonical: `${siteUrl}/license`,
});

useHead({
	script: [
		{
			type: 'application/ld+json',
			innerHTML: JSON.stringify({
				'@context': 'https://schema.org',
				'@type': 'WebPage',
				name: 'License — Slingshot',
				url: `${siteUrl}/license`,
				dateModified: lastUpdated,
				isPartOf: {
					'@type': 'WebSite',
					name: 'Slingshot',
					url: siteUrl,
				},
				about: {
					'@type': 'CreativeWork',
					name: 'GNU Affero General Public License v3.0',
					identifier: 'AGPL-3.0',
				},
			}),
		},
	],
});
</script>

<template>
	<LegalPage title="License" title-accent="License" :last-updated="lastUpdated" :html="html" />
</template>
