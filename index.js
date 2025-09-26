const { Client, GatewayIntentBits, PollLayoutType } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const POLL_CHANNEL_ID = process.env.POLL_CHANNEL_ID;

const STARTING_EPISODE = 32;

function formatDateKorean(date) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  };
  return date.toLocaleDateString("ko-KR", options);
}

// 현재 회차 계산 함수
function calculateCurrentEpisode() {
  const baseDate = new Date("2024-01-01");
  const now = new Date();

  const timeDiff = now.getTime() - baseDate.getTime();
  const weeksPassed = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 7));

  return STARTING_EPISODE + weeksPassed;
}

function getWeekendDates() {
  const now = new Date();
  const monday = new Date(now);

  const daysSinceMonday = (now.getDay() + 6) % 7;
  monday.setDate(now.getDate() - daysSinceMonday);

  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    saturday: formatDateKorean(saturday),
    sunday: formatDateKorean(sunday),
  };
}

async function createWeeklyPollAndExit() {
  try {
    console.log("Discord 봇에 연결 중...");

    await new Promise((resolve, reject) => {
      client.once("ready", resolve);
      client.once("error", reject);
      client.login(BOT_TOKEN);
    });

    console.log(`봇이 ${client.user.tag}로 로그인되었습니다!`);

    const channel = await client.channels.fetch(POLL_CHANNEL_ID);
    if (!channel) {
      throw new Error("채널을 찾을 수 없습니다.");
    }

    const dates = getWeekendDates();
    const currentEpisode = calculateCurrentEpisode();

    console.log(`📅 현재 회차: ${currentEpisode}회차`);

    const poll = {
      question: {
        text: `모각작 ${currentEpisode}회차 참가 모집`,
      },
      answers: [
        {
          poll_media: {
            text: `토요일 (${dates.saturday})`,
          },
        },
        {
          poll_media: {
            text: `일요일 (${dates.sunday})`,
          },
        },
      ],
      duration: 72,
      allow_multiselect: true,
      layout_type: PollLayoutType.Default,
    };

    await channel.send({
      poll: poll,
    });

    console.log(
      `✅ 모각작 ${currentEpisode}회차 투표가 성공적으로 게시되었습니다!`
    );
    console.log(`📅 토요일: ${dates.saturday}`);
    console.log(`📅 일요일: ${dates.sunday}`);
    console.log(`⏰ 투표는 72시간 후 자동 종료됩니다.`);
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  } finally {
    // 작업 완료 후 봇 종료
    console.log("봇을 종료합니다...");
    client.destroy();
    process.exit(0);
  }
}

createWeeklyPollAndExit();
