import { getInput, setFailed } from '@actions/core'
import { context } from '@actions/github'
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'

interface IBuildStatus5Message {
  context: typeof context
  labels: Record<string, string>
  status: string
}

async function main() {
  const labels: Record<string, string> = {}
  for (let i = 1; i <= 10; ++i) {
    const label = getInput(`label${i}`, { required: false })
    let [key, ...values] = label.split('=') as [string, string | undefined]
    key = key.trim()
    const value = values.join('=').trim()
    if (key && value) {
      labels[key] = value
    }
  }

  const status = getInput('job-status', { required: true })

  const message: IBuildStatus5Message = { context, labels, status }

  const sns = new SNSClient({})
  await sns.send(
    new PublishCommand({
      TopicArn: getInput('topic-arn', { required: true }),
      Subject: 'build-status-v5',
      Message: JSON.stringify(message),
    }),
  )
}

main().catch((e) => setFailed(e.message))
