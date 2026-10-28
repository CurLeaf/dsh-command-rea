import { randomUUID } from 'node:crypto'

/**
 * `/rea <target or question>` — hand the request to the agent as a normal user
 * message that explicitly asks for the reverse-engineer-anything skill and the
 * REA MCP tools. The command result itself stays out of model history.
 */
export const name = 'command-rea'
export const inject = ['commands']

const USAGE = '用法：/rea <目标路径或问题>'

export function apply(ctx) {
  ctx.effect(function* () {
    yield ctx.commands.register({
      name: 'rea',
      description: '用 REA 逆向分析目标（/rea <路径或问题>）',
      input: { hint: '<目标路径或问题>' },
      handler: ({ agent, rawInput }) => {
        const task = rawInput.trim()
        if (task.length === 0) return { kind: 'error', text: USAGE }

        // Same shape and immutability createUserMessage() produces: identified,
        // role-tagged user message with user source. followup() starts or queues
        // a normal turn.
        const block = Object.freeze({
          type: 'text',
          text: `请先加载 reverse-engineer-anything skill，然后使用 REA 完成以下任务：\n\n${task}`,
        })
        const message = Object.freeze({
          id: randomUUID(),
          role: 'user',
          content: Object.freeze([block]),
          source: Object.freeze({ kind: 'user' }),
        })
        agent.followup(message)

        return { kind: 'success', text: `已提交给 REA：${task}` }
      },
    })
  }, 'command-rea lifecycle')
}
