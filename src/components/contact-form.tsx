import emailjs from '@emailjs/browser';
import React, { useState } from 'react';

emailjs.init(import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY);

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await emailjs.sendForm(
        import.meta.env.PUBLIC_EMAILJS_SERVICE_ID,
        import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID,
        e.target,
        import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY
      );

      if (result.text === 'OK') {
        alert('お問い合わせを受け付けました。');
        e.target.reset();
      } else {
        throw new Error('送信に失敗しました');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('エラーが発生しました。しばらく時間をおいて再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* お問い合わせ種別 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="type">
          お問い合わせ種別 <span className="text-red-500">*</span>
        </label>
        <select
          id="type"
          name="type"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="">選択してください</option>
          <option value="web">Webアプリ開発について</option>
          <option value="mobile">モバイルアプリ開発について</option>
          <option value="prototype">プロトタイプ・POC作成について</option>
          <option value="global">海外向けサービス開発について</option>
          <option value="other">その他のご相談</option>
        </select>
      </div>

      {/* 会社名 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="company_name">
          会社名 <span>（任意）</span>
        </label>
        <input
          type="text"
          id="company_name"
          name="company_name"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="株式会社やまびこ"
        />
      </div>

      {/* お名前 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
          お名前 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="山田 太郎"
        />
      </div>

      {/* メールアドレス */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="example@example.com"
        />
      </div>

      {/* メッセージ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="message">
          メッセージ <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows="5"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="お問い合わせ内容を入力してください"
        ></textarea>
      </div>

      {/* 送信ボタン */}
      <div className="text-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex justify-center px-8 py-4 rounded-full font-bold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              送信中...
            </>
          ) : (
            '送信する'
          )}
        </button>
      </div>
    </form>
  );
};

export default ContactForm;
