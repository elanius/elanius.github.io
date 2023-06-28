---
icon: fas fa-code-fork
order: 5

# Handler for this is added to the _includes/head.html but not here but where gem jekyll-theme-chirpy-6.0.1 is installed.
# It could be found be command bundle info --path jekyll-theme-chirpy.
# Is is because I am using chirpy starter theme, not full chirpy.
custom_js:
- gitgraph
- story
---

Welcome to my interactive CV, presented as a Git graph! Feel free to explore each commit for a more detailed understanding of the roles I've undertaken and the work I've accomplished within various companies. If you prefer a conventional format, you can access my PDF resume [here](/assets/resume-alexovic.pdf).

> Clicking is not working yet.
{: .prompt-warning }

<!-- DOM element in which we'll mount our graph -->
<div id="graph-container"></div>

<!-- <script src="{{ base.url | prepend: site.url }}/assets/js/story.js"></script> -->
