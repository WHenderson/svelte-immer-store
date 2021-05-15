# Semantic commits control version and publish releases via [dripip](https://github.com/prisma-labs/dripip)

## Initial development

| Message                            | Version Bump |
|------------------------------------|--------------|
| `fix:`                             | minor        |
| `...BREAKING CHANGE:`              | minor        |
| `...COMPLETES INITIAL DEVELOPMENT` | minor        |

## Post initial development 

| Message                            | Version Bump |
|------------------------------------|--------------|
| `fix:`                             | patch        |
| `feat:`                            | minor        |
| `...BREAKING CHANGE:`              | major        |
| `anything:`                        | patch        |
| `chore:`                           | none         |

