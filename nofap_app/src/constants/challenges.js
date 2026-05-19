const REWARD_MESSAGES = {
  normal: {
    1: 'Bạn giữ được 1 ngày rồi. Cứ đi tiếp từng bước thôi.',
    3: '3 ngày liên tiếp. Nhịp mới đã bắt đầu đều hơn.',
    7: '7 ngày rồi. Bạn đang làm khá ổn.',
    9: '9 ngày bền bỉ. Mọi thứ đang vào khuôn.',
    11: '11 ngày ổn định. Đừng vội, cứ đi đều.',
    13: '13 ngày kiên trì. Rất đáng khen.',
    15: '15 ngày liên tục. Bạn đang tiến rất tốt.',
    17: '17 ngày. Nhịp này giữ được thì tốt lắm.',
    19: '19 ngày. Bạn đã đi gần hơn mục tiêu rồi.',
    21: '21 ngày. Một mốc khá chắc chắn.',
    23: '23 ngày. Thói quen mới đang bám vững hơn.',
    30: '30 ngày tròn. Một mốc rất đáng nhớ.',
    60: '60 ngày. Bạn đã giữ được một quãng khá dài.',
    90: '90 ngày. Thành quả này rất lớn.',
    999: '999 ngày. Bạn đã đi rất xa.',
  },
  safe: {
    1: 'Bạn đã đi được 1 ngày. Khởi đầu tốt, tiếp tục giữ nhịp.',
    3: '3 ngày liên tiếp. Thói quen mới đang hình thành.',
    7: '7 ngày vững vàng. Đủ để thấy sự thay đổi.',
    9: '9 ngày bền bỉ. Sức mạnh tự chủ tăng rõ.',
    11: '11 ngày ổn định. Giữ nhịp, đừng dao động.',
    13: '13 ngày kiên trì. Đáng tự hào!',
    15: '15 ngày liên tục. Bạn đang làm rất tốt.',
    17: '17 ngày. Tập trung cao, giữ vững!',
    19: '19 ngày. Một bước gần hơn tới mục tiêu lớn.',
    21: '21 ngày. Thói quen mới đã vững.',
    23: '23 ngày. Tư duy đã khác trước.',
    30: '30 ngày tròn. Một cột mốc quan trọng.',
    60: '60 ngày. Bản lĩnh thật sự đã thành hình.',
    90: '90 ngày. Một hành trình đáng nể.',
    999: '999 ngày. Bạn đã đi rất xa.',
  },
  hardcore: {
    1: 'Một ngày nhập môn. Đạo tâm vừa mở, đừng để gió lay.',
    3: 'Ba ngày liên tục. Nội tức đã yên, tâm trí sáng hơn.',
    7: 'Bảy ngày vượt ải. Linh khí hội tụ, ngươi đã khác xưa.',
    9: 'Chín ngày giữ tâm. Đạo cơ dần vững, không được lùi.',
    11: 'Mười một ngày kết khí. Vượt thêm một tầng ý chí.',
    13: 'Mười ba ngày viên mãn. Kiên trì mới là thần thông.',
    15: 'Mười lăm ngày thành thế. Tâm ma đã yếu đi.',
    17: 'Mười bảy ngày. Ý chí như kiếm, càng rèn càng bén.',
    19: 'Mười chín ngày. Khí vận dày, không được lãng phí.',
    21: 'Hai mươi mốt ngày. Đạo tâm đã an, hãy giữ.',
    23: 'Hai mươi ba ngày. Một bước gần cảnh giới mới.',
    30: 'Ba mươi ngày. Thiên lôi thử thách, ngươi đã sẵn sàng.',
    60: 'Sáu mươi ngày. Độ kiếp thành, danh xưng đã khác.',
    90: 'Chín mươi ngày. Phi thăng đã hiện trước mắt.',
    999: 'Chín trăm chín mươi chín ngày. Độc tôn vạn giới.',
  },
};

const FAIL_MESSAGES = {
  normal: [
    {
      maxDays: 2,
      title: 'MỚI BẮT ĐẦU',
      body: 'Mấy ngày đầu chưa vững là bình thường. Cứ làm lại và đi tiếp thôi.',
    },
    {
      maxDays: 6,
      title: 'CHƯA ĐỀU NHỊP',
      body: 'Bạn đã cố gắng rồi, chỉ là nhịp chưa đều. Đừng ngại bắt đầu lại.',
    },
    {
      maxDays: 9999,
      title: 'BỊ NGẮT NHỊP',
      body: 'Bạn đã đi được một đoạn rồi, nhưng bị ngắt giữa chừng. Làm lại để ổn hơn.',
    },
  ],
  safe: [
    {
      maxDays: 2,
      title: 'THẤT BẠI RỒI',
      body: 'Khởi đầu chưa vững. Hãy thử lại và giữ nhịp ổn định hơn.',
    },
    {
      maxDays: 6,
      title: 'CHƯA ỔN ĐỊNH',
      body: 'Bạn đã cố gắng, nhưng thói quen chưa vững. Đừng bỏ cuộc.',
    },
    {
      maxDays: 9999,
      title: 'RỚT NHỊP',
      body: 'Bạn đã đi xa, nhưng lại đứt mạch. Làm lại để mạnh hơn.',
    },
  ],
  hardcore: [
    {
      maxDays: 2,
      title: 'ĐẠO TÂM YẾU',
      body: 'Mới nhập môn đã lung lay. Không đủ kiên định thì khó thành đạo.',
    },
    {
      maxDays: 6,
      title: 'TÂM MA QUẤY NHIỄU',
      body: 'Ngươi đã tiến nhưng tự cắt đứt khí mạch. Quay lại và giữ vững.',
    },
    {
      maxDays: 9999,
      title: 'TẨU HỎA NHẬP MA',
      body: 'Đường đã dài mà ngươi vẫn ngã. Ngẩng đầu và bắt đầu lại.',
    },
  ],
};

const CHALLENGE_MESSAGES = {
  normal: {
    8: 'Ngày 8: Giữ bình tĩnh khi gặp cám dỗ nhỏ. Chỉ cần qua hôm nay là được.',
  },
  safe: {
    8: 'Thử thách ngày 8: Giữ tâm bình thản khi gặp cám dỗ nhỏ. Bạn làm được.',
  },
  hardcore: {
    8: 'Thử thách ngày 8: Cám dỗ đến gần, hãy nhìn thẳng và không dao động.',
  },
};

export const getRewardMessage = (days, theme, tone) => {
  const set = REWARD_MESSAGES[theme] || REWARD_MESSAGES[tone] || REWARD_MESSAGES.safe;
  return set[days] || null;
};

export const getFailMessage = (days, theme, tone) => {
  const set = FAIL_MESSAGES[theme] || FAIL_MESSAGES[tone] || FAIL_MESSAGES.safe;
  return set.find((item) => days <= item.maxDays) || set[set.length - 1];
};

export const getChallengeMessage = (days, theme, tone) => {
  const set = CHALLENGE_MESSAGES[theme] || CHALLENGE_MESSAGES[tone] || CHALLENGE_MESSAGES.safe;
  return set[days] || null;
};
