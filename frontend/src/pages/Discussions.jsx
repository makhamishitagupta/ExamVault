import { useState } from 'react';
import { discussions } from '../data/mockData';
import { FiMessageCircle } from 'react-icons/fi';

const Discussions = () => {
  const [showForm, setShowForm] = useState(false);
  const [discussionList, setDiscussionList] = useState(discussions);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [newAnswer, setNewAnswer] = useState('');

  const handleSubmitQuestion = (e) => {
    e.preventDefault();
    if (formData.title.trim() && formData.description.trim()) {
      const newDiscussion = {
        id: discussionList.length + 1,
        title: formData.title,
        author: 'You',
        date: new Date().toISOString().split('T')[0],
        replies: 0,
        content: formData.description,
        answers: []
      };
      setDiscussionList([newDiscussion, ...discussionList]);
      setFormData({ title: '', description: '' });
      setShowForm(false);
    }
  };

  const handlePostAnswer = () => {
    if (newAnswer.trim() && selectedDiscussion) {
      const answer = {
        id: selectedDiscussion.answers.length + 1,
        author: 'You',
        date: new Date().toISOString().split('T')[0],
        content: newAnswer
      };
      const updated = discussionList.map(d => {
        if (d.id === selectedDiscussion.id) {
          return {
            ...d,
            answers: [...d.answers, answer],
            replies: d.replies + 1
          };
        }
        return d;
      });
      setDiscussionList(updated);
      setSelectedDiscussion({
        ...selectedDiscussion,
        answers: [...selectedDiscussion.answers, answer],
        replies: selectedDiscussion.replies + 1
      });
      setNewAnswer('');
    }
  };

  if (selectedDiscussion) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setSelectedDiscussion(null)}
            className="mb-4 text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Discussions</span>
          </button>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{selectedDiscussion.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
              <span>Posted by {selectedDiscussion.author}</span>
              <span>•</span>
              <span>{selectedDiscussion.date}</span>
              <span>•</span>
              <span>{selectedDiscussion.replies} replies</span>
            </div>
            <p className="text-gray-700 mb-6">{selectedDiscussion.content}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Replies ({selectedDiscussion.answers.length})
            </h2>
            {selectedDiscussion.answers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No replies yet. Be the first to answer!</p>
            ) : (
              <div className="space-y-4">
                {selectedDiscussion.answers.map((answer) => (
                  <div key={answer.id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900">{answer.author}</span>
                      <span className="text-sm text-gray-500">{answer.date}</span>
                    </div>
                    <p className="text-gray-700">{answer.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Write your answer here..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
            />
            <button
              onClick={handlePostAnswer}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Post Answer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FiMessageCircle className="w-7 h-7 text-blue-600" />
            Discussions
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {showForm ? 'Cancel' : 'Ask a Doubt'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ask a Question</h2>
            <form onSubmit={handleSubmitQuestion}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter your question title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your question in detail..."
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Post Question
              </button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {discussionList.map((discussion) => (
            <div
              key={discussion.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedDiscussion(discussion)}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{discussion.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{discussion.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Posted by {discussion.author}</span>
                  <span>•</span>
                  <span>{discussion.date}</span>
                </div>
                <div className="flex items-center space-x-1 text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-medium">{discussion.replies} replies</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Discussions;

