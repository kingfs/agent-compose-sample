# 值班员小钟有四个闹钟，但只需要一份工牌

> 栏目：04 · 多种触发方式

小钟负责检查服务状态。领导的要求听起来很简单：整点看一次；每隔一小时报个平安；系统启动半分钟后记得复查；如果业务突然发来一条事件，马上看。

小钟认真记下四条，第二天带来了四个闹钟。一个挂墙上，一个绑手腕，一个放桌上，还有一个长得像门铃。九点整，它们因为测试配置同时响了。整个办公室都知道服务很健康，只有小钟不太健康。

![值班员小钟和四种性格的闹钟](../assets/scheduled-triggers.svg)

## 四种“现在该干活了”

`scheduled-agent` 没有真的招聘四位值班员。它只定义一个 `assistant`，再给它四种被叫醒的理由：

- `cron` 看日历和钟点，适合“工作日九点”这种约定；
- `interval` 只关心隔了多久，适合心跳和周期提醒；
- `timeout` 从启动后等一次，适合延迟初始化或复查；
- `event` 不看表，外面的事情发生了就行动。

四个入口最终都找到同一个 Agent。不同 prompt 会告诉它“是谁按了铃、这次该做什么”，它则用同一份岗位守则输出来源、任务和下一步。

这背后有个很朴素的设计：**工作内容相同，不必因为叫醒方式不同复制四份员工。**

## 先把四个铃都按一遍

```bash
cd agents/scheduled-agent
agent-compose config --quiet
agent-compose up
agent-compose scheduler ls assistant
```

`startup-reminder` 会在启动约 30 秒后自己响一次。开发时不必坐等整点，可以手动触发：

```bash
agent-compose scheduler trigger assistant hourly-status
agent-compose scheduler trigger assistant recurring-heartbeat
agent-compose scheduler trigger assistant startup-reminder
agent-compose scheduler trigger assistant external-event \
  --payload '{"source":"manual-demo"}'
```

有个经典小坑：cron 看的是 daemon 所在环境的时区。你以为写的是“九点上班”，它八点就精神抖擞，往往不是 Agent 过度敬业，而是你们对“九点”所在的时区没有达成共识。

## 门铃后面如果不是一件简单的事呢？

声明式 trigger 很适合“铃响后，把这句话交给 Agent”。如果铃响后还要判断今天是不是节假日、查上次状态、叫第二位 Agent、失败重试三次再通知人，这就不再是一个简单门铃，而是一位调度员的工作，应改用 `scheduler.script`。

再往前一步，如果连会出现多少工作分支都要等现场才知道，就轮到 dynamic workflow。三者没有高低之分：门铃解决“何时开始”，脚本解决“固定步骤怎么走”，动态工作流解决“路有几条还不知道”。

## 小钟最后留下了几个闹钟？

四个，但它们被安静地写进了配置里，不再占满桌面。每天几点、隔多久、启动后等多久、监听什么事件，都能一眼查清。值班员仍只有一位，工作记录也归在同一个名字下。

自动化并不总是 cron。业务世界会按日历来，会隔一阵来，会在启动后姗姗来迟，也会突然敲门。`scheduled-agent` 给出的答案是：**铃可以各有脾气，接电话的人不必分身。**

需要四种 trigger 的精确字段、观察命令和时区提醒，请看 [scheduled-agent README](../../agents/scheduled-agent/README.md)。
