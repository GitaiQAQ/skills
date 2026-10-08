# @flome/hone-it

`hone-it` is an Agent Skill for performing bounded, gated recursive
improvement of a target project.

The RSI subject is the project, not this skill. The LLM drives the loop by
feeding Agent Notes, project conventions, and other Skills back into the
project, while `bootstrap`, `maintain`, `audit`, and `recover` keep each round
bounded and stoppable.

This package contains the Skill source. Use a community-compatible Skills
installer to place it in your agent's Skills directory.