import React, { useState } from 'react';

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const form = e.currentTarget; // フォームの参照を保存

    try {
      const formData = new FormData(form);
      const data = {
        name: formData.get('from_name'),
        email: formData.get('reply_to'),
        message: formData.get('message'),
        type: formData.get('type'),
        company: formData.get('company_name'),
        phone: formData.get('phone')
      };

      console.log('Sending contact form data:', data);

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      console.log('Contact API response:', response.status, result);

      if (response.ok && result.success) {
        setSubmitStatus('success');
        alert('✅ お問い合わせを受け付けました。\n担当者より1-2営業日以内にご連絡いたします。');
        form.reset(); // 保存した参照を使用

        // 5秒後にステータスをリセット
        setTimeout(() => {
          setSubmitStatus('idle');
        }, 5000);
      } else {
        console.error('API returned error:', result);
        throw new Error(result.error || result.details || '送信に失敗しました');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`❌ エラーが発生しました。\n\n詳細: ${errorMessage}\n\nしばらく時間をおいて再度お試しください。`);

      // 3秒後にステータスをリセット
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
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
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="company">
            会社名 <span className="text-gray-500">(任意)</span>
          </label>
          <input
            type="text"
            id="company"
            name="company_name"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="株式会社Beekle"
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
            name="from_name"
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
            name="reply_to"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="your-email@example.com"
          />
        </div>

        {/* 電話番号 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="phone">
            電話番号 <span className="text-gray-500">(任意)</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="03-1234-5678"
          />
        </div>

        {/* お問い合わせ内容 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="message">
            お問い合わせ内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="具体的な内容をご記入ください"
          />
        </div>

        {/* 受信者名（非表示） */}
        <input
          type="hidden"
          name="to_name"
          value="管理者"
        />

        {/* プライバシーポリシー */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="privacy"
              name="privacy"
              type="checkbox"
              required
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
          </div>
          <div className="ml-3">
            <label className="text-sm text-gray-700" htmlFor="privacy">
              <a href="/privacy" className="text-purple-600 hover:text-purple-500 underline">プライバシーポリシー</a>
              に同意します
            </label>
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="text-center">
          {submitStatus === 'success' && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                ✅ お問い合わせを受け付けました！<br />
                <span className="text-sm">担当者より1-2営業日以内にご連絡いたします。</span>
              </p>
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">
                ❌ エラーが発生しました<br />
                <span className="text-sm">しばらく時間をおいて再度お試しください。</span>
              </p>
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting || submitStatus === 'success'}
            className={`inline-flex justify-center items-center px-8 py-4 rounded-full font-bold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isSubmitting || submitStatus === 'success'
                ? 'bg-gray-400 cursor-not-allowed'
                : submitStatus === 'error'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                送信中...
              </>
            ) : submitStatus === 'success' ? (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                送信完了
              </>
            ) : (
              '送信する'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
