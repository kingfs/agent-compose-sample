ARG AGENT_COMPOSE_IMAGE=agent-compose:latest
ARG AGENT_COMPOSE_GUEST_IMAGE=chaitin/agent-compose-guest:latest

FROM ${AGENT_COMPOSE_IMAGE} AS control-plane
RUN cp -L /usr/local/bin/agent-compose /tmp/agent-compose

FROM ${AGENT_COMPOSE_GUEST_IMAGE}

COPY --from=control-plane /tmp/agent-compose /usr/local/bin/agent-compose
COPY .agents/skills/create-agent-compose-agents /opt/agent-creator/skills/create-agent-compose-agents

RUN chmod 0755 /usr/local/bin/agent-compose \
      /opt/agent-creator/skills/create-agent-compose-agents/scripts/*.mjs && \
    /usr/local/bin/agent-compose version >/dev/null && \
    test -f /opt/agent-creator/skills/create-agent-compose-agents/SKILL.md

ENV AGENT_CREATOR_SKILL=/opt/agent-creator/skills/create-agent-compose-agents/SKILL.md
