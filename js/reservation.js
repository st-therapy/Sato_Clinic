/* Learning demo only: no form submission, network requests or data storage. */
(() => {
  'use strict';
  const form = document.getElementById('reservation-form');
  if (!form) return;
  const fields = [...form.querySelectorAll('input, select')];
  const summary = document.getElementById('error-summary');
  const errorList = document.getElementById('error-list');
  const status = document.getElementById('check-status');
  const touched = new Set();
  let checked = false;

  // Keep the same readable word groups in dynamically displayed feedback.
  const copyPhrases = [
    "入力しないでください", "JavaScript", "入力してください", "選択してください", "行われていません", "お選びください", 
    "お使いください", "ご確認ください", "入力例を入れる", "行われません", "いただけます", "入力チェック", 
    "必須の4項目", "ありません", "できません", "学習用デモ", "入力練習用", "希望診療科", 
    "ネット予約", "送信・保存", "選べます", "できます", "ましょう", "ください", 
    "入力形式", "入力内容", "予約入力", "予約内容", "個人情報", "郵便番号", 
    "生年月日", "都道府県", "市区町村", "一般内科", "空き状況", "数字7桁", 
    "ハイフン", "チェック", "サンプル", "午前のみ", "学習用", "希望日", 
    "診療科", "入力例", "ご入力", "ご希望", "ご予約", "お困り", 
    "休診", "土曜", "木曜", "日曜", "午前", "架空", 
    "氏名", "住所", "予約", "体験", "実際", "情報", 
    "送信", "保存", "成立", "任意", "必須", "表示", 
    "症状", "内容", "入力", "確認", "項目", "画面", 
    "花子"
  ];
  const copyPattern = new RegExp('(?:' + copyPhrases.join('|') + ')[。！？]?', 'g');
  function copyParts(text) {
    const parts = [];
    function appendPlain(chunk) {
      for (const char of chunk) {
        if (/[。！？]/.test(char)) {
          let tail = char;
          // Attach a short ending without cutting a protected word in half.
          while (parts.length && [...tail].length < 4 &&
                 !/[\s。！？]/.test(parts[parts.length - 1].text)) {
            tail = parts.pop().text + tail;
          }
          parts.push({ text: tail, phrase: true });
        } else {
          parts.push({ text: char, phrase: false });
        }
      }
    }
    let position = 0;
    for (const match of text.matchAll(copyPattern)) {
      appendPlain(text.slice(position, match.index));
      parts.push({ text: match[0], phrase: true });
      position = match.index + match[0].length;
    }
    appendPlain(text.slice(position));
    return parts;
  }
  function setCopy(element, text) {
    element.replaceChildren();
    for (const part of copyParts(text)) {
      if (!part.phrase) {
        element.append(document.createTextNode(part.text));
        continue;
      }
      const phrase = document.createElement('span');
      phrase.className = 'reservation-phrase';
      phrase.textContent = part.text;
      element.append(phrase);
    }
  }

  function todayInJapan() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const part = type => parts.find(item => item.type === type).value;
    return part('year') + '-' + part('month') + '-' + part('day');
  }
  function updateDateLimits() {
    const today = todayInJapan();
    document.getElementById('visit-date').min = today;
    document.getElementById('birth-date').max = today;
    return today;
  }
  updateDateLimits();

  function messageFor(field) {
    const value = field.value.trim();
    const today = updateDateLimits();
    if (field.id === 'visit-date') {
      if (!value) return '希望日を入力または選択してください。';
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || field.validity.badInput) return '希望日を正しい日付で入力してください。';
      if (value < today) return '希望日は今日以降の日付を選択してください。';
      const day = new Date(value + 'T12:00:00Z').getUTCDay();
      if (day === 0 || day === 4) return '木曜・日曜は休診です。別の日付を選択してください。';
    }
    if (field.id === 'department' && !value) return '希望診療科を選択してください。';
    if (field.id === 'patient-name' && !value) return '入力練習用の架空の氏名を入力してください。';
    if (field.id === 'birth-date') {
      if (!value) return '入力練習用の生年月日を入力または選択してください。';
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || field.validity.badInput) return '生年月日を正しい日付で入力してください。';
      if (value > today) return '生年月日は今日以前の日付を選択してください。';
    }
    if (field.id === 'postal-code' && value) {
      const normalized = value.replace(/[０-９]/g, char => String.fromCharCode(char.charCodeAt(0) - 0xFEE0)).replace(/[ー－−]/g, '-');
      if (!/^\d{3}-?\d{4}$/.test(normalized)) return '郵便番号は数字7桁で入力してください（例：000-0000）。';
    }
    if (field.validity.tooLong) return '入力できる文字数を超えています。短くしてお試しください。';
    return '';
  }
  function validate(field) {
    const message = messageFor(field);
    const error = document.getElementById(field.id + '-error');
    setCopy(error, message);
    error.hidden = !message;
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
    return message;
  }
  function refreshSummary() {
    errorList.replaceChildren();
    const invalid = fields.filter(field => field.getAttribute('aria-invalid') === 'true');
    summary.hidden = !invalid.length;
    document.getElementById('error-summary-title').textContent = '入力内容をご確認ください（' + invalid.length + '項目）';
    for (const field of invalid) {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = '#' + field.id;
      li.className = 'reservation-copy';
      setCopy(link, document.getElementById(field.id + '-error').textContent);
      link.addEventListener('click', event => { event.preventDefault(); field.focus(); });
      li.append(link);
      errorList.append(li);
    }
    return invalid.length;
  }
  for (const field of fields) {
    field.addEventListener('blur', () => {
      touched.add(field.id);
      validate(field);
      if (checked) refreshSummary();
    });
    const onEdit = () => {
      setCopy(status, '');
      if (touched.has(field.id) || checked) validate(field);
      if (checked) refreshSummary();
    };
    field.addEventListener('input', onEdit);
    field.addEventListener('change', onEdit);
  }
  document.getElementById('check-input').addEventListener('click', () => {
    checked = true;
    setCopy(status, '');
    fields.forEach(validate);
    if (refreshSummary()) {
      summary.focus();
      return;
    }
    setCopy(status, '入力形式に問題はありません。この画面は学習用デモです。予約や入力内容の送信・保存は行われていません。');
  });
  function clearFeedback() {
    checked = false;
    touched.clear();
    summary.hidden = true;
    errorList.replaceChildren();
    for (const field of fields) {
      field.removeAttribute('aria-invalid');
      const error = document.getElementById(field.id + '-error');
      error.hidden = true;
      error.textContent = '';
    }
    setCopy(status, '');
  }
  document.getElementById('fill-example').addEventListener('click', () => {
    clearFeedback();
    const next = new Date(todayInJapan() + 'T12:00:00Z');
    do { next.setUTCDate(next.getUTCDate() + 1); } while ([0, 4].includes(next.getUTCDay()));
    const samples = {
      'visit-date': next.toISOString().slice(0, 10),
      'department': 'general',
      'patient-name': 'サンプル 花子',
      'birth-date': '1990-04-01',
      'postal-code': '000-0000',
      'patient-address': '架空県サンプル市練習町1-2-3'
    };
    fields.forEach(field => { field.value = samples[field.id]; });
    setCopy(status, '架空の入力例を入れました。内容を変更したり、入力チェックをお試しいただけます。');
    document.getElementById('visit-date').focus();
  });
  document.getElementById('clear-input').addEventListener('click', () => {
    clearFeedback();
    fields.forEach(field => { field.value = ''; });
    setCopy(status, '入力内容を消去しました。');
    document.getElementById('visit-date').focus();
  });
})();
