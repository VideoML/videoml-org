import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { Layout, Hero, Section } from "../../components";
import { githubBlobUrl, githubRepoUrl } from "../../lib/github";
import { NPM_PACKAGE_URLS } from "../../lib/links";

const PackagesPage: React.FC<PageProps> = () => {
  return (
    <Layout>
      <Hero
        eyebrow="Packages"
        title="VideoML NPM Modules"
        subtitle="Reference implementations published as composable packages."
        links={[
          { label: "View page source", href: githubBlobUrl("site", "src/pages/docs/packages.tsx") },
        ]}
      />

      <Section>
        <h2 id="videoml-player">@videoml/player</h2>
        <p className="meta-links">
          NPM:{" "}
          <a href={NPM_PACKAGE_URLS.player} target="_blank" rel="noreferrer">
            @videoml/player
          </a>
          {" · "}
          GitHub:{" "}
          <a href={githubRepoUrl("player")} target="_blank" rel="noreferrer">
            VideoML/player
          </a>
          {" · "}
          Source:{" "}
          <a href={githubBlobUrl("player", "src/web-component.ts")} target="_blank" rel="noreferrer">
            web-component.ts
          </a>
          {" · "}
          <a href={githubBlobUrl("player", "src/runtime.ts")} target="_blank" rel="noreferrer">
            runtime.ts
          </a>
        </p>
        <p>
          Browser runtime + web component. Drop <code>&lt;vml-player&gt;</code>
          into any page to preview VideoML.
        </p>
        <pre className="code-block">
{`import { defineVmlPlayer } from "@videoml/player";

defineVmlPlayer();

// HTML
// <vml-player src="/videos/intro.babulus.xml" auto-play></vml-player>`}
        </pre>
      </Section>

      <Section tone="alt">
        <h2 id="videoml-stdlib">@videoml/stdlib</h2>
        <p className="meta-links">
          NPM:{" "}
          <a href={NPM_PACKAGE_URLS.stdlib} target="_blank" rel="noreferrer">
            @videoml/stdlib
          </a>
          {" · "}
          GitHub:{" "}
          <a href={githubRepoUrl("stdlib")} target="_blank" rel="noreferrer">
            VideoML/stdlib
          </a>
          {" · "}
          Source:{" "}
          <a href={githubBlobUrl("stdlib", "src/dom/components.ts")} target="_blank" rel="noreferrer">
            dom/components.ts
          </a>
          {" · "}
          <a href={githubBlobUrl("stdlib", "src/tokens/index.ts")} target="_blank" rel="noreferrer">
            tokens/index.ts
          </a>
        </p>
        <p>
          Standard library of layouts, typography, colors, and components with
          DOM + React parity.
        </p>
        <pre className="code-block">
{`import { registerVideoMLComponents } from "@videoml/stdlib/dom";
import { TitleSlideLayout } from "@videoml/stdlib/react";`}
        </pre>
      </Section>

      <Section>
        <h2 id="videoml-toolchain">@videoml/toolchain</h2>
        <p className="meta-links">
          NPM:{" "}
          <a href={NPM_PACKAGE_URLS.toolchain} target="_blank" rel="noreferrer">
            @videoml/toolchain
          </a>
          {" · "}
          GitHub:{" "}
          <a href={githubRepoUrl("toolchain")} target="_blank" rel="noreferrer">
            VideoML/toolchain
          </a>
          {" · "}
          Source:{" "}
          <a href={githubBlobUrl("toolchain", "src/generate.ts")} target="_blank" rel="noreferrer">
            generate.ts
          </a>
          {" · "}
          <a href={githubBlobUrl("toolchain", "src/index.ts")} target="_blank" rel="noreferrer">
            index.ts
          </a>
        </p>
        <p>
          Core library for loading VML, generating timing/audio artifacts, and
          rendering outputs. The <code>@videoml/cli</code> wraps this.
        </p>
        <pre className="code-block">
{`import { generateComposition } from "@videoml/toolchain";

const artifacts = await generateComposition("content/intro.babulus.xml");`}
        </pre>
      </Section>

      <Section tone="alt">
        <h2 id="videoml-cli">@videoml/cli</h2>
        <p className="meta-links">
          NPM:{" "}
          <a href={NPM_PACKAGE_URLS.cli} target="_blank" rel="noreferrer">
            @videoml/cli
          </a>
          {" · "}
          GitHub:{" "}
          <a href={githubRepoUrl("cli")} target="_blank" rel="noreferrer">
            VideoML/cli
          </a>
          {" · "}
          Source:{" "}
          <a href={githubBlobUrl("cli", "src/cli.ts")} target="_blank" rel="noreferrer">
            cli.ts
          </a>
        </p>
        <p>Render VideoML to MP4 with the <code>vml</code> CLI.</p>
        <pre className="code-block">
{`vml generate content/intro.babulus.xml
vml render --script src/videos/intro/intro.script.json --frames .videoml/out/intro/frames --out intro.mp4`}
        </pre>
      </Section>
    </Layout>
  );
};

export default PackagesPage;

export const Head: HeadFC = () => <title>VideoML Packages</title>;
