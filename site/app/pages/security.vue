<script setup>
import rawMd from '~/legal/security.md?raw';
import { useMarkdown } from '~/composables/useMarkdown';

const {
	public: { siteUrl },
} = useRuntimeConfig();

const lastUpdated = 'July 17, 2026';
const { html } = useMarkdown(rawMd, { date: lastUpdated });

useSeoMeta({
	title: 'Security Policy | Slingshot',
	description: 'How to report security vulnerabilities in Slingshot responsibly.',
	ogTitle: 'Security Policy — Slingshot',
	ogDescription: 'How to report security vulnerabilities in Slingshot responsibly.',
	ogUrl: `${siteUrl}/security`,
	twitterTitle: 'Security Policy — Slingshot',
	twitterDescription: 'How to report security vulnerabilities in Slingshot responsibly.',
	canonical: `${siteUrl}/security`,
});

useHead({
	script: [
		{
			type: 'application/ld+json',
			innerHTML: JSON.stringify({
				'@context': 'https://schema.org',
				'@type': 'WebPage',
				name: 'Security Policy — Slingshot',
				url: `${siteUrl}/security`,
				dateModified: lastUpdated,
				isPartOf: {
					'@type': 'WebSite',
					name: 'Slingshot',
					url: siteUrl,
				},
				about: {
					'@type': 'ContactPoint',
					name: 'Security Disclosures',
					email: 'slingshot.dev@proton.me',
					contactType: 'security',
				},
			}),
		},
	],
});
</script>

<template>
	<LegalPage title="Security Policy" title-accent="Policy" :last-updated="lastUpdated" :html="html" />
</template>
