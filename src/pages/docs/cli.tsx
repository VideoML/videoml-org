import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { Layout, Hero, Section, Callout } from "../../components";
import { githubBlobUrl, githubRepoUrl } from "../../lib/github";
import { NPM_PACKAGE_URLS } from "../../lib/links";

const CliPage: React.FC<PageProps> = () => {
  return (
    <Layout>
      <Hero
        eyebrow="CLI"
        title="vml Command Line"
        subtitle="Generate assets, render frames, and encode MP4s from VideoML."
        links={[
          { label: "View page source", href: githubBlobUrl("site", "src/pages/docs/cli.tsx") },
          { label: "GitHub repo", href: githubRepoUrl("cli") },
          { label: "NPM: @videoml/cli", href: NPM_PACKAGE_URLS.cli },
        ]}
      />

      <Section>
        <h2>Generate</h2>
        <p>
          Generates timing JSON and audio assets from a VideoML DSL file. Uses
          <code> .videoml/config.yml</code> (falls back to <code>.babulus/config.yml</code>).
        </p>
        <pre className="code-block">
{`vml generate content/intro.babulus.xml
vml generate --watch content/intro.babulus.xml`}
        </pre>
      </Section>

      <Section tone="alt">
        <h2>Render</h2>
        <p>
          Renders PNG frames + MP4 from a script.json. Accepts timeline and audio
          overrides.
        </p>
        <pre className="code-block">
{`vml render \
  --script src/videos/intro/intro.script.json \
  --timeline src/videos/intro/intro.timeline.json \
  --frames .videoml/out/intro/frames \
  --out public/videoml/intro.mp4`}
        </pre>
      </Section>

      <Section>
        <h2>Pipeline</h2>
        <p>Runs generate + render in one command.</p>
        <pre className="code-block">
{`vml pipeline content/intro.babulus.xml --out public/videoml/intro.mp4`}
        </pre>
        <Callout tone="info">
          Tip: use <code>--project-dir</code> when running from outside the repo
          root.
        </Callout>
      </Section>
    </Layout>
  );
};

export default CliPage;

export const Head: HeadFC = () => <title>VideoML CLI</title>;
