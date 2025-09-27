const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const REMINDER_CHANNEL_ID = process.env.REMINDER_CHANNEL_ID;

function getCurrentDayAndTime() {
  const now = new Date();
  const koreaTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Seoul" })
  );

  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const dayName = days[koreaTime.getDay()];
  const hour = koreaTime.getHours();

  return { dayName, hour, koreaTime };
}

function getReminderMessage() {
  const { dayName } = getCurrentDayAndTime();

  if (dayName === "수") {
    const urgentMessages = [
      `오늘 모각작 참가 모집 투표 마감일입니다!\n참가를 고민하시는 분께서는 마감 전에 잊지 마시고 투표해주세요!`,
      `모각작 참가 모집이 금일 마감됩니다!\n참가하실 분들은 잊지 마시고 투표해주세요!`,
    ];
    return urgentMessages[Math.floor(Math.random() * urgentMessages.length)];
  }

  const regularMessages = `금주 모각작 참가 모집이 진행중입니다~\n참가하실 분은 잊지 말고 원하시는 날짜에 투표해주세요~`;

  return regularMessages;
}

async function sendReminderAndExit() {
  try {
    console.log("Discord 봇에 연결 중...");

    await new Promise((resolve, reject) => {
      client.once("ready", resolve);
      client.once("error", reject);
      client.login(BOT_TOKEN);
    });

    console.log(`봇이 ${client.user.tag}로 로그인되었습니다!`);

    const channel = await client.channels.fetch(REMINDER_CHANNEL_ID);
    if (!channel) {
      throw new Error("알림 채널을 찾을 수 없습니다.");
    }

    const { dayName, hour, koreaTime } = getCurrentDayAndTime();
    const reminderMessage = getReminderMessage();

    await channel.send(reminderMessage);

    console.log(
      `✅ ${dayName}요일 ${hour}시 ${
        dayName === "수" ? "마감 안내" : "투표 알림"
      }이 전송되었습니다!`
    );
    console.log(`📝 전송된 메시지: ${reminderMessage}`);
    console.log(`⏰ 전송 시간: ${koreaTime.toLocaleString("ko-KR")}`);
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  } finally {
    console.log("알림 봇을 종료합니다...");
    client.destroy();
    process.exit(0);
  }
}

sendReminderAndExit();
