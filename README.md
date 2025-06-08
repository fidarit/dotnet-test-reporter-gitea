# Dotnet Test Reporter (Gitea version)
#### A Gitea action to parse test & coverage results and post them as a PR comment.
- The action can process dotnet test results (a single or multiple `.trx` files), if there are any failing tests the action will fail. This allows integrating the action into your CI pipeline to short circuit and prevent further build/deploy operations as well as merging the code that caused tests to fail.
- Optionally, test coverage can also be provided (a single opencover or cobertura `.xml` file) as well as a minimum coverage percentage threshold.
If the threshold is provided and the coverage is not sufficient the action will fail.
- The action also generates a [workflow summary](#summary-example) - a more detailed overview of processed tests and test coverage. For your convenience you can see the summary by following the link in the [comment](#comment-example).
- The action allows many configurations to suit your needs, please visit the [Inputs](#Inputs) and [Examples](#Examples) sections.
#### Comment example
![image](https://github.com/user-attachments/assets/337cbf0c-a2ee-4adf-9556-9e0ddf629177)



<b>Note:</b> despite this action was created specifically for dotnet you can use it with other languages and frameworks as long as you can generate `.trx` files. For example, your project can be a C#/dotnet backend with a TS/react frontend, in that case you would use the action twice. For react app you would need to:
- install `jest-trx-results-processor` package to generate `.trx` test result files 
- add `cobertura` to `coverageReporters` array in case you would like to include a coverage

## Inputs

#### `github-token`
**Required** - GitHub repository token.

#### `results-path`
**Required** - Path to the `.trx` file(s) containing test results. Supports glob patterns.
<br/>Examples: `./TestResults/result.trx`, `./**/*.trx`

#### `coverage-path`
**Optional** - Path to the file containing test coverage. Supports glob patterns.
<br/>Examples: `./TestResults/coverage.xml`, `./**/coverage.xml`

#### `coverage-type`
**Optional** - Coverage file type. Supported types are `opencover` and `cobertura`.
<br/>Default: `opencover`

#### `coverage-threshold`
**Optional** - Minimum allowed coverage. You can provide a coverage percentage ranging from `0.00` to `100.00`.
<br/>Example: `80.42`

#### `comment-title`
**Optional** - Pull Request comment title.
<br/>Example: `My Custom Title`
<br/>Default: `Test Results`

#### `post-new-comment`
**Optional** - Boolean flag. 
Set to `true` to post a new comment after each run. 
Set to `false` or leave blank to only update an existing comment.
<br/>Default: `false`

#### `allow-failed-tests`
**Optional** - Boolean flag. 
Set to `true` to prevent failed tests from failing the job.
Set to `false` or leave blank to fail the job if there are any failed tests (recommended).
<br/>Default: `false`

#### `show-failed-tests-only`
**Optional** - Boolean flag. 
Set to `true` to show only the failed tests. This is useful if you have many tests and the results exceed the markdown comment limit in github
Set to `false` or leave blank to show all the test results (recommended).
<br/>Default: `false`

#### `show-test-output`
**Optional** - Boolean flag. 
Set to `true` or leave blank to show the output of the tests. (recommended).
Set to `false` if there is too much output leading to truncation on the summary
<br/>Default: `true`

#### `changed-files-and-line-numbers`
**Optional** - Array of changed files and lines numbers. 
<br/>Examples: `[{"name":"Specifications\\BaseSpecification.cs","lineNumbers":[17,18,19]}]`
<br/>Default: `[]`

## Outputs

- `tests-total`
Total number of tests

- `tests-passed`
Number of tests passed

- `tests-failed`
Number of tests failed

- `tests-skipped`
Number of tests skipped

- `coverage-line`
Line code coverage

- `coverage-lines-total`
Total lines of code

- `coverage-lines-covered`
Lines of code covered

- `coverage-branch`
Branch code coverage

- `coverage-branches-total`
Total branches

- `coverage-branches-covered`
Branches covered

## Examples
<b>Note:</b> please, always use the latest version

```yaml
uses: fidarit/dotnet-test-reporter-gitea@v1
with:
  github-token: ${{ secrets.GITHUB_TOKEN }}
  comment-title: 'Unit Test Results'
  results-path: ./TestResults/*.trx
  coverage-path: ./TestResults/coverage.xml
  coverage-threshold: 80
```
