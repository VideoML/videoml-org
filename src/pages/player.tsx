import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { Layout, Hero, Section, Callout } from "../components";
import { githubBlobUrl, githubRepoUrl } from "../lib/github";
import { NPM_PACKAGE_URLS } from "../lib/links";

const PlayerPage: React.FC<PageProps> = () => {
  return (
    <Layout>
      <Hero
        eyebrow="Reference Player"
        title="A canonical implementation of the VideoML runtime"
        subtitle="The reference player validates the spec by providing a portable runtime model for playback, inspection, and tooling."
        links={[
          { label: "View page source", href: githubBlobUrl("site", "src/pages/player.tsx") },
          { label: "GitHub repo", href: githubRepoUrl("player") },
          { label: "NPM: @videoml/player", href: NPM_PACKAGE_URLS.player },
        ]}
      />

      <Section>
        <h2>Responsibilities</h2>
        <ul>
          <li>Parse VideoML into a stable runtime object model</li>
          <li>Resolve timing, cues, and scene boundaries</li>
          <li>Expose inspection APIs for tools and validators</li>
          <li>Provide consistent playback behavior</li>
        </ul>
      </Section>

      <Section tone="alt">
        <h2>NPM Module</h2>
        <p>
          The player is published as <code>@videoml/player</code>, including a
          web component and runtime helpers for integrating VideoML on any page.
        </p>
        <pre className="code-block">
{`import { defineVmlPlayer } from "@videoml/player";

defineVmlPlayer();

// HTML
// <vml-player src="/videos/intro.babulus.xml" auto-play></vml-player>`}
        </pre>
        <Callout tone="info">
          See <a href="/docs/packages">packages</a> and{" "}
          <a href="/docs/standard">standard</a> for usage details.
        </Callout>
      </Section>
    </Layout>
  );
};

export default PlayerPage;

export const Head: HeadFC = () => <title>VideoML Player</title>;
