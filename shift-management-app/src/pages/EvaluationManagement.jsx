import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Star, Send, Target, TrendingUp, X, Edit, Eye } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '../store/useAuthStore';
import { evaluationAPI, authAPI } from '../api/config';

const EvaluationManagement = () => {
  const { user, isManager } = useAuthStore();
  const [activeTab, setActiveTab] = useState('evaluations');
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingEvaluation, setEditingEvaluation] = useState(null);

  const [evaluationForm, setEvaluationForm] = useState({
    userId: '',
    evaluationDate: format(new Date(), 'yyyy-MM-dd'),
    periodStart: '',
    periodEnd: '',
    workQuality: 3,
    punctuality: 3,
    teamwork: 3,
    customerService: 3,
    improvement: 3,
    strengths: '',
    areasForImprovement: '',
    goals: '',
    comments: ''
  });

  const [feedbackForm, setFeedbackForm] = useState({
    toUserId: '',
    feedbackType: 'positive',
    feedbackText: '',
    category: '',
    isAnonymous: false
  });

  const [goalForm, setGoalForm] = useState({
    userId: user?.id || '',
    title: '',
    description: '',
    targetDate: ''
  });

  // Fetch users for evaluation
  const { data: users = [] } = useQuery({
    queryKey: ['users-for-evaluation'],
    queryFn: async () => {
      const response = await authAPI.getAllUsers();
      return response.data.map(user => ({
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim()
      }));
    }
  });

  // Fetch evaluations
  const { data: evaluations = [], refetch: refetchEvaluations } = useQuery({
    queryKey: ['evaluations', user?.id, user?.role],
    queryFn: async () => {
      const params = user?.role === 'staff' ? { userId: user.id } : {};
      const { data } = await evaluationAPI.getEvaluations(params);
      return data;
    }
  });

  // Fetch feedback
  const { data: feedback = [], refetch: refetchFeedback } = useQuery({
    queryKey: ['feedback', user?.id],
    queryFn: async () => {
      const { data } = await evaluationAPI.getFeedback(user?.id);
      return data;
    },
    enabled: activeTab === 'feedback'
  });

  // Fetch goals
  const { data: goals = [], refetch: refetchGoals } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      const { data } = await evaluationAPI.getGoals(user?.id);
      return data;
    },
    enabled: activeTab === 'goals'
  });

  // Fetch motivation stats
  const { data: motivationStats } = useQuery({
    queryKey: ['motivation', user?.id],
    queryFn: async () => {
      const { data } = await evaluationAPI.getMotivationStats(user?.id);
      return data;
    },
    enabled: activeTab === 'motivation'
  });

  // Create evaluation mutation
  const createEvaluationMutation = useMutation({
    mutationFn: (data) => evaluationAPI.createEvaluation(data),
    onSuccess: () => {
      toast.success('評価を作成しました');
      setShowEvaluationModal(false);
      resetEvaluationForm();
      refetchEvaluations();
    },
    onError: (error) => toast.error(error.response?.data?.error || '評価の作成に失敗しました')
  });

  // Update evaluation mutation
  const updateEvaluationMutation = useMutation({
    mutationFn: ({ id, data }) => evaluationAPI.updateEvaluation(id, data),
    onSuccess: () => {
      toast.success('評価を更新しました');
      setEditingEvaluation(null);
      setShowDetailModal(false);
      resetEvaluationForm();
      refetchEvaluations();
    },
    onError: (error) => toast.error(error.response?.data?.error || '評価の更新に失敗しました')
  });

  // Create feedback mutation
  const createFeedbackMutation = useMutation({
    mutationFn: (data) => evaluationAPI.createFeedback({
      userId: data.toUserId,
      feedbackType: data.feedbackType,
      category: data.category,
      message: data.feedbackText,
      isAnonymous: data.isAnonymous
    }),
    onSuccess: () => {
      toast.success('フィードバックを送信しました');
      setShowFeedbackModal(false);
      setFeedbackForm({ toUserId: '', feedbackType: 'positive', feedbackText: '', category: '', isAnonymous: false });
      refetchFeedback();
    },
    onError: (error) => toast.error(error.response?.data?.error || 'フィードバックの送信に失敗しました')
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: (data) => evaluationAPI.createGoal(data),
    onSuccess: () => {
      toast.success('目標を追加しました');
      setShowGoalModal(false);
      setGoalForm({ userId: user?.id || '', title: '', description: '', targetDate: '' });
      refetchGoals();
    },
    onError: (error) => toast.error(error.response?.data?.error || '目標の追加に失敗しました')
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }) => evaluationAPI.updateGoal(id, data),
    onSuccess: () => {
      toast.success('目標を更新しました');
      refetchGoals();
    },
    onError: (error) => toast.error(error.response?.data?.error || '目標の更新に失敗しました')
  });

  const resetEvaluationForm = () => {
    setEvaluationForm({
      userId: '',
      evaluationDate: format(new Date(), 'yyyy-MM-dd'),
      periodStart: '',
      periodEnd: '',
      workQuality: 3,
      punctuality: 3,
      teamwork: 3,
      customerService: 3,
      improvement: 3,
      strengths: '',
      areasForImprovement: '',
      goals: '',
      comments: ''
    });
  };

  const handleSubmitEvaluation = (e) => {
    e.preventDefault();
    if (!evaluationForm.userId) {
      toast.error('スタッフを選択してください');
      return;
    }
    if (editingEvaluation) {
      updateEvaluationMutation.mutate({ id: editingEvaluation.id, data: evaluationForm });
    } else {
      createEvaluationMutation.mutate(evaluationForm);
    }
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (!feedbackForm.toUserId || !feedbackForm.feedbackText) {
      toast.error('必須項目を入力してください');
      return;
    }
    createFeedbackMutation.mutate(feedbackForm);
  };

  const handleSubmitGoal = (e) => {
    e.preventDefault();
    if (!goalForm.title) {
      toast.error('目標タイトルを入力してください');
      return;
    }
    createGoalMutation.mutate({ ...goalForm, userId: user?.id });
  };

  const handleUpdateGoalProgress = (goalId, progress, status) => {
    updateGoalMutation.mutate({ id: goalId, data: { progress, status } });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const renderEvaluationDetail = (evaluation) => {
    const isEditing = editingEvaluation?.id === evaluation.id;
    const canEdit = isManager();

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">スタッフ</p>
            <p className="font-medium">{evaluation.user_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">評価日</p>
            <p className="font-medium">{evaluation.evaluation_date}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">評価項目</h4>
          <div className="space-y-2">
            {[
              { key: 'workQuality', label: '作業品質' },
              { key: 'punctuality', label: '時間厳守' },
              { key: 'teamwork', label: 'チームワーク' },
              { key: 'customerService', label: '顧客サービス' },
              { key: 'improvement', label: '改善意欲' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{label}</span>
                {isEditing ? (
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={evaluationForm[key]}
                    onChange={(e) => setEvaluationForm({...evaluationForm, [key]: parseInt(e.target.value)})}
                    className="w-32"
                  />
                ) : (
                  <div className="flex items-center space-x-1">
                    {renderStars(evaluation[key])}
                    <span className="text-sm text-gray-600 ml-2">({evaluation[key]})</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="font-medium">総合評価</span>
              <div className="flex items-center space-x-1">
                {renderStars(Math.round(evaluation.overall_rating))}
                <span className="text-lg font-bold text-blue-600 ml-2">{evaluation.overall_rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {(evaluation.strengths || evaluation.areas_for_improvement || evaluation.goals || evaluation.comments) && (
          <div className="border-t pt-4 space-y-3">
            {evaluation.strengths && (
              <div>
                <p className="text-sm text-gray-600 font-medium">強み</p>
                <p className="text-sm text-gray-800">{evaluation.strengths}</p>
              </div>
            )}
            {evaluation.areas_for_improvement && (
              <div>
                <p className="text-sm text-gray-600 font-medium">改善点</p>
                <p className="text-sm text-gray-800">{evaluation.areas_for_improvement}</p>
              </div>
            )}
            {evaluation.goals && (
              <div>
                <p className="text-sm text-gray-600 font-medium">目標</p>
                <p className="text-sm text-gray-800">{evaluation.goals}</p>
              </div>
            )}
            {evaluation.comments && (
              <div>
                <p className="text-sm text-gray-600 font-medium">コメント</p>
                <p className="text-sm text-gray-800">{evaluation.comments}</p>
              </div>
            )}
          </div>
        )}

        {canEdit && !isEditing && (
          <div className="flex space-x-2 pt-4 border-t">
            <button
              onClick={() => {
                setEditingEvaluation(evaluation);
                setEvaluationForm({
                  userId: evaluation.user_id,
                  evaluationDate: evaluation.evaluation_date,
                  periodStart: evaluation.period_start || '',
                  periodEnd: evaluation.period_end || '',
                  workQuality: evaluation.work_quality,
                  punctuality: evaluation.punctuality,
                  teamwork: evaluation.teamwork,
                  customerService: evaluation.customer_service,
                  improvement: evaluation.improvement,
                  strengths: evaluation.strengths || '',
                  areasForImprovement: evaluation.areas_for_improvement || '',
                  goals: evaluation.goals || '',
                  comments: evaluation.comments || ''
                });
              }}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="h-4 w-4" />
              <span>編集</span>
            </button>
          </div>
        )}

        {isEditing && (
          <div className="flex space-x-2 pt-4 border-t">
            <button
              onClick={() => updateEvaluationMutation.mutate({ id: evaluation.id, data: evaluationForm })}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              更新
            </button>
            <button
              onClick={() => {
                setEditingEvaluation(null);
                resetEvaluationForm();
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">評価・モチベーション管理</h1>

      {/* Tabs */}
      <div className="mb-6 border-b">
        <div className="flex space-x-8">
          {['evaluations', 'feedback', 'goals', 'motivation'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'evaluations' && '評価'}
              {tab === 'feedback' && 'フィードバック'}
              {tab === 'goals' && '目標'}
              {tab === 'motivation' && 'モチベーション'}
            </button>
          ))}
        </div>
      </div>

      {/* Evaluations Tab */}
      {activeTab === 'evaluations' && (
        <div>
          {isManager() && (
            <div className="mb-4">
              <button
                onClick={() => setShowEvaluationModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Star className="h-4 w-4" />
                <span>評価を作成</span>
              </button>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">評価一覧</h2>
              <div className="space-y-4">
                {evaluations.length > 0 ? (
                  evaluations.map((evaluation) => (
                    <div key={evaluation.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedItem(evaluation);
                        setShowDetailModal(true);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{evaluation.user_name}</p>
                          <p className="text-sm text-gray-600">{evaluation.evaluation_date}</p>
                          <p className="text-xs text-gray-500">評価者: {evaluation.evaluator_name}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {renderStars(Math.round(evaluation.overall_rating))}
                          </div>
                          <span className="text-lg font-bold text-blue-600">{evaluation.overall_rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">評価がありません</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div>
          <div className="mb-4">
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Send className="h-4 w-4" />
              <span>フィードバックを送る</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">受信フィードバック</h2>
              <div className="space-y-4">
                {feedback.length > 0 ? (
                  feedback.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">
                            {item.is_anonymous ? '匿名' : item.from_user_name}
                          </p>
                          <p className="text-xs text-gray-500">{format(new Date(item.created_at), 'yyyy/MM/dd HH:mm')}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.feedback_type === 'positive' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {item.feedback_type === 'positive' ? 'ポジティブ' : '建設的'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{item.message}</p>
                      {item.category && (
                        <p className="text-xs text-gray-500 mt-2">カテゴリ: {item.category}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">フィードバックがありません</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div>
          <div className="mb-4">
            <button
              onClick={() => setShowGoalModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Target className="h-4 w-4" />
              <span>目標を追加</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">目標一覧</h2>
              <div className="space-y-4">
                {goals.length > 0 ? (
                  goals.map((goal) => (
                    <div key={goal.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium">{goal.title}</p>
                          {goal.description && (
                            <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                          goal.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {goal.status === 'completed' ? '達成' :
                           goal.status === 'in_progress' ? '進行中' : '未着手'}
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">進捗</span>
                          <span className="font-medium">{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${goal.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      {goal.target_date && (
                        <p className="text-xs text-gray-500 mt-2">
                          目標日: {format(new Date(goal.target_date), 'yyyy/MM/dd')}
                        </p>
                      )}
                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => handleUpdateGoalProgress(goal.id, Math.min(100, goal.progress + 25), goal.progress + 25 >= 100 ? 'completed' : 'in_progress')}
                          className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          進捗+25%
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">目標がありません</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Motivation Tab */}
      {activeTab === 'motivation' && motivationStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">最新評価</p>
              <Star className="h-5 w-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{motivationStats.latestRating.toFixed(1)}</p>
            <div className="flex items-center space-x-1 mt-2">
              {renderStars(Math.round(motivationStats.latestRating))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">目標達成率</p>
              <Target className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-600">{motivationStats.goalAchievementRate}%</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">ポジティブフィードバック</p>
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-600">{motivationStats.positiveFeedbackCount}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">評価トレンド</p>
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div className="space-y-1">
              {motivationStats.evaluationTrend.map((trend, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{format(new Date(trend.date), 'MM/dd')}</span>
                  <span className="font-medium">{trend.rating.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Modal */}
      {showEvaluationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">評価を作成</h2>
              <button onClick={() => { setShowEvaluationModal(false); resetEvaluationForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitEvaluation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">スタッフ</label>
                <select value={evaluationForm.userId} onChange={(e) => setEvaluationForm({...evaluationForm, userId: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="">選択してください</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">評価日</label>
                  <input type="date" value={evaluationForm.evaluationDate} onChange={(e) => setEvaluationForm({...evaluationForm, evaluationDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">期間開始</label>
                  <input type="date" value={evaluationForm.periodStart} onChange={(e) => setEvaluationForm({...evaluationForm, periodStart: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">期間終了</label>
                  <input type="date" value={evaluationForm.periodEnd} onChange={(e) => setEvaluationForm({...evaluationForm, periodEnd: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">評価項目 (1-5)</h3>
                {[
                  { key: 'workQuality', label: '作業品質' },
                  { key: 'punctuality', label: '時間厳守' },
                  { key: 'teamwork', label: 'チームワーク' },
                  { key: 'customerService', label: '顧客サービス' },
                  { key: 'improvement', label: '改善意欲' }
                ].map(({ key, label }) => (
                  <div key={key} className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700">{label}</label>
                      <span className="text-sm font-medium text-blue-600">{evaluationForm[key]}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={evaluationForm[key]}
                      onChange={(e) => setEvaluationForm({...evaluationForm, [key]: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">強み</label>
                <textarea value={evaluationForm.strengths} onChange={(e) => setEvaluationForm({...evaluationForm, strengths: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows="2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">改善点</label>
                <textarea value={evaluationForm.areasForImprovement} onChange={(e) => setEvaluationForm({...evaluationForm, areasForImprovement: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows="2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">目標</label>
                <textarea value={evaluationForm.goals} onChange={(e) => setEvaluationForm({...evaluationForm, goals: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows="2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">コメント</label>
                <textarea value={evaluationForm.comments} onChange={(e) => setEvaluationForm({...evaluationForm, comments: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows="3" />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  作成
                </button>
                <button type="button" onClick={() => { setShowEvaluationModal(false); resetEvaluationForm(); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">フィードバックを送る</h2>
              <button onClick={() => setShowFeedbackModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">送信先</label>
                <select value={feedbackForm.toUserId} onChange={(e) => setFeedbackForm({...feedbackForm, toUserId: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="">選択してください</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">種類</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input type="radio" value="positive" checked={feedbackForm.feedbackType === 'positive'} onChange={(e) => setFeedbackForm({...feedbackForm, feedbackType: e.target.value})} className="mr-2" />
                    <span>ポジティブ</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" value="constructive" checked={feedbackForm.feedbackType === 'constructive'} onChange={(e) => setFeedbackForm({...feedbackForm, feedbackType: e.target.value})} className="mr-2" />
                    <span>建設的</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ（任意）</label>
                <input type="text" value={feedbackForm.category} onChange={(e) => setFeedbackForm({...feedbackForm, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="例: チームワーク、接客" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
                <textarea value={feedbackForm.feedbackText} onChange={(e) => setFeedbackForm({...feedbackForm, feedbackText: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows="4" required />
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" checked={feedbackForm.isAnonymous} onChange={(e) => setFeedbackForm({...feedbackForm, isAnonymous: e.target.checked})} className="mr-2" />
                  <span className="text-sm text-gray-700">匿名で送信</span>
                </label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  送信
                </button>
                <button type="button" onClick={() => setShowFeedbackModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">目標を追加</h2>
              <button onClick={() => setShowGoalModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">目標タイトル</label>
                <input type="text" value={goalForm.title} onChange={(e) => setGoalForm({...goalForm, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">説明（任意）</label>
                <textarea value={goalForm.description} onChange={(e) => setGoalForm({...goalForm, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows="3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">目標日（任意）</label>
                <input type="date" value={goalForm.targetDate} onChange={(e) => setGoalForm({...goalForm, targetDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  追加
                </button>
                <button type="button" onClick={() => setShowGoalModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">評価詳細</h2>
              <button onClick={() => { setShowDetailModal(false); setSelectedItem(null); setEditingEvaluation(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            {renderEvaluationDetail(selectedItem)}
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationManagement;
