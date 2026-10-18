<script setup>
import rawMd from '~/legal/terms.md?raw';
import { useMarkdown } from '~/composables/useMarkdown';

const {
	public: { siteUrl },
} = useRuntimeConfig();

const lastUpdated = 'July 17, 2026';
const { html } = useMarkdown(rawMd, { date: lastUpdated });

useSeoMeta({
	title: 'Terms of Service | Slingshot',
	description: 'Terms governing the use of the Slingshot desktop application, website, and feedback form.',
	ogTitle: 'Terms of Service — Slingshot',
	ogDescription: 'Terms governing the use of the Slingshot desktop application, website, and feedback form.',
	ogUrl: `${siteUrl}/terms`,
	twitterTitle: 'Terms of Service — Slingshot',
	twitterDescription: 'Terms governing the use of the Slingshot desktop application, website, and feedback form.',
	canonical: `${siteUrl}/terms`,
});

useHead({
	script: [
		{
			type: 'application/ld+json',
			innerHTML: JSON.stringify({
				'@context': 'https://schema.org',
				'@type': 'TermsOfService',
				name: 'Terms of Service — Slingshot',
				url: `${siteUrl}/terms`,
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
	<LegalPage title="Terms of Service" title-accent="Service" :last-updated="lastUpdated" :html="html" />
</template>
