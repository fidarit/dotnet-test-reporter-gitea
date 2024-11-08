import { processTestResults } from './results';
import { processTestCoverage } from './coverage';
import { getInputs, publishComment, setFailed, setSummary } from './utils';
import { formatChangedFileCoverageMarkdown, formatCoverageMarkdown, formatResultMarkdown } from './formatting/markdown';
import { formatCoverageHtml, formatResultHtml, formatTitleHtml } from './formatting/html';

const run = async (): Promise<void> => {
  try {
    const {
      token,
      title,
      resultsPath,
      coveragePath,
      coverageType,
      coverageThreshold,
      postNewComment,
      allowFailedTests,
      changedFilesAndLineNumbers,
      showFailedTestsOnly,
      showTestOutput
    } = getInputs();

    let comment = '';
    let summary = formatTitleHtml(title);

    const testResult = await processTestResults(resultsPath, allowFailedTests);
    comment += formatResultMarkdown(testResult);
    summary += formatResultHtml(testResult, showFailedTestsOnly, showTestOutput);

    if (coveragePath) {
      const testCoverage = await processTestCoverage(coveragePath, coverageType, coverageThreshold, changedFilesAndLineNumbers);
      comment += testCoverage ? formatCoverageMarkdown(testCoverage, coverageThreshold) : '';
      summary += testCoverage ? formatCoverageHtml(testCoverage) : '';
      if (testCoverage) {
        for(const myMod of testCoverage.modules) {
          const changedFiles = myMod.files.filter(f => f.changedLinesTotal > 0);
          if (changedFiles.length > 0) {
            const tempComment = formatChangedFileCoverageMarkdown(changedFiles);
            await publishComment(token, `${myMod.name}'s Changed File Coverage`, tempComment, postNewComment);
          }
        }
      }
    }

    if (process.env['GITEA_ACTIONS']) {
        console.log('This is a Gitea Action');

        if (process.env['GITHUB_EVENT_NAME']?.startsWith('pull_')) {
            let url = `${process.env['GITHUB_API_URL']}/repos/${process.env['GITHUB_REPOSITORY']}/issues/${process.env['GITHUB_REF_NAME']}/comments`;

            // Gitea doesn't support Summarys yet, so combine the comment and summary, see https://github.com/go-gitea/gitea/issues/23721
            const combinedComment = `${comment}\r\n<details><summary>Details</summary>\r\n${summary}\r\n</details>`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `token ${token}`,
                    'accept': 'application/json'
                },
                body: JSON.stringify({ body: combinedComment }),
            });

            if (!response.ok) {
                response.text().then((text) => {
                    throw new Error(`Error calling Grita API: Response status: ${response.status}, Response Text: ${text}`);
                })
            }
        } else {
            console.log('This isn\'t a pull request');
        }

    } else {
        await setSummary(summary);
        await publishComment(token, title, comment, postNewComment);
    }
  } catch (error) {
    setFailed((error as Error).message);
  }
};

run();
