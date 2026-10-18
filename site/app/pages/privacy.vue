<script setup>
import rawMd from '~/legal/privacy.md?raw';
import { useMarkdown } from '~/composables/useMarkdown';

const {
	public: { siteUrl },
} = useRuntimeConfig();

const lastUpdated = 'July 17, 2026';
const { html } = useMarkdown(rawMd, { date: lastUpdated });

useSeoMeta({
	title: 'Privacy Policy | Slingshot',
	description: 'How Slingshot handles your data across the desktop application and website. We collect minimal data and respect your privacy.',
	ogTitle: 'Privacy Policy — Slingshot',
	ogDescription: 'How Slingshot handles your data across the desktop application and website. We collect minimal data and respect your privacy.',
	ogUrl: `${siteUrl}/privacy`,
	twitterTitle: 'Privacy Policy — Slingshot',
	twitterDescription: 'How Slingshot handles your data across the desktop application and website. We collect minimal data and respect your privacy.',
	canonical: `${siteUrl}/privacy`,
});

useHead({
	script: [
		{
			type: 'application/ld+json',
			innerHTML: JSON.stringify({
				'@context': 'https://schema.org',
				'@type': 'PrivacyPolicy',
				name: 'Privacy Policy — Slingshot',
				url: `${siteUrl}/privacy`,
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
	<LegalPage title="Privacy Policy" title-accent="Policy" :last-updated="lastUpdated" :html="html" />
</template>
