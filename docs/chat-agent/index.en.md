# Alice Is Finally Done Answering “Where Is the Link?”

> Column: 01 · Chat agent

At 9:03 on Monday, Alice answered the same question for the fourth time: “Where is the expense portal?” By lunch, she had become a human search box.

![Alice and the digital receptionist](../assets/chat-agent-flow.svg)

So the team gave the front desk a new colleague: `chat`. It does not read minds or quietly browse company systems. It simply accepts a question from the CLI, a web app, or an internal service, then follows one honest role guide to answer it.

The small `chat-agent` example keeps that boundary visible. The daemon is the front door, `chat` is the receptionist, and the configured provider supplies the model. Change the entrance; keep the receptionist.

```bash
cd agents/chat-agent
agent-compose config --quiet
agent-compose up
agent-compose run -it chat --prompt "Hi, where should a new teammate start?"
```

Once the terminal path works, a service can call the same Agent through the daemon Connect API. Start with the smallest useful conversation before adding memory, tools, or a knowledge base. A system that cannot access attendance data should not announce that someone was late.

Alice now handles the repeatable questions. People handle the exceptions. That is the whole lesson: give an Agent the front-desk key first, and decide later whether it deserves the whole building.

For exact fields and API details, see the [chat-agent README](../../agents/chat-agent/README.en.md).
