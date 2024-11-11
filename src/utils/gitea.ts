import { log } from './action';

export const publishCommentToGitea = async (
  token: string,
  comment: string,
  summary: string,
  postNew: boolean
): Promise<void> => {
    log('This is a Gitea Action');

    if (!process.env['GITHUB_EVENT_NAME']?.startsWith('pull_')) {
        log(`Expected a pull request event, not a ${process.env['GITHUB_EVENT_NAME']}.`);
        log(comment);
        return;
    }

    const existingComment = !postNew ? await getExistingComment(token) : null;

    // Gitea doesn't support summaries yet, so combine the comment and summary, see https://github.com/go-gitea/gitea/issues/23721
    let combinedComment = `[comment]: # (dotnet-test-reporter-${process.env['GITHUB_REF_NAME']})\n${comment}\r\n<details><summary>Details</summary>\r\n${summary}\r\n</details>`;

    if (existingComment && !postNew) {
      await updateComment(token, existingComment, combinedComment);
    } else {
      await createComment(token, combinedComment);
    }
};

const createComment = async (token: string, body: string) => {
    const url = `${process.env['GITHUB_API_URL']}/repos/${process.env['GITHUB_REPOSITORY']}/issues/${process.env['GITHUB_REF_NAME']}/comments`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${token}`,
            'accept': 'application/json'
        },
        body: JSON.stringify({ body: body }),
    });

    if (!response.ok) {
        response.text().then((text) => {
            throw new Error(`Error calling Grita API: Response status: ${response.status}, Response Text: ${text}`);
        })
    }
}

const updateComment = async (token: string, existingComment: any, body: string) => {
    const url = `${process.env['GITHUB_API_URL']}/repos/${process.env['GITHUB_REPOSITORY']}/issues/${process.env['GITHUB_REF_NAME']}/comments/${existingComment.id}`;

    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${token}`,
            'accept': 'application/json'
        },
        body: JSON.stringify({ body: body }),
    });

    if (!response.ok) {
        response.text().then((text) => {
            throw new Error(`Error calling Grita API: Response status: ${response.status}, Response Text: ${text}`);
        })
    }
}

const getExistingComment = async (token: string) => {

    const url = `${process.env['GITHUB_API_URL']}/repos/${process.env['GITHUB_REPOSITORY']}/issues/${process.env['GITHUB_REF_NAME']}/comments`;

    let firstComment = null;

    await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${token}`,
            'accept': 'application/json'
        }
    })
        .then(res => res.json())
        .then(data => {
            let comments = data as Array<any>; //TODO: correct type
            firstComment = comments.find(c => c.body.startsWith(`[comment]: # (dotnet-test-reporter-${process.env['GITHUB_REF_NAME']})`));
        });

    return firstComment;
};
