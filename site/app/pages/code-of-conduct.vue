<script setup>
import rawMd from '~/legal/code-of-conduct.md?raw';
import { useMarkdown } from '~/composables/useMarkdown';

const {
	public: { siteUrl },
} = useRuntimeConfig();

const lastUpdated = 'July 17, 2026';
const { html } = useMarkdown(rawMd, { date: lastUpdated });

useSeoMeta({
	title: 'Code of Conduct | Slingshot',
	description: 'Community standards and expectations for the Slingshot project.',
	ogTitle: 'Code of Conduct — Slingshot',
	ogDescription: 'Community standards and expectations for the Slingshot project.',
	ogUrl: `${siteUrl}/code-of-conduct`,
	twitterTitle: 'Code of Conduct — Slingshot',
	twitterDescription: 'Community standards and expectations for the Slingshot project.',
	canonical: `${siteUrl}/code-of-conduct`,
});

useHead({
	script: [
		{
			type: 'application/ld+json',
			innerHTML: JSON.stringify({
				'@context': 'https://schema.org',
				'@type': 'WebPage',
				name: 'Code of Conduct — Slingshot',
				url: `${siteUrl}/code-of-conduct`,
				dateModified: lastUpdated,
				isPartOf: {
					'@type': 'WebSite',
					name: 'Slingshot',
					url: siteUrl,
				},
			}),
		},
	],
});
</script>

<template>
	<LegalPage title="Code of Conduct" :last-updated="lastUpdated" :html="html" />
</template>
