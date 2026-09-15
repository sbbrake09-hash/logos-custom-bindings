"use client";
export default function ProjectError({ reset }: { reset: () => void }) { return <main id="main-content" className="container section"><h1>This project couldn’t be loaded.</h1><p>The gallery is temporarily unavailable. Please try again shortly.</p><button className="button" onClick={reset}>Try again</button> <a href="/portfolio/">Back to portfolio</a></main>; }
