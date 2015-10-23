import {Map, fromJS} from 'immutable';
import {createAction} from 'redux-actions';
import fetch from 'isomorphic-fetch';
import { ownAddress } from '../../shared-settings'; // relative path for the sake of tests


const SELECT_QUESTION = 'voting/SELECT_QUESTION';
const SELECT_ANSWER = 'voting/SELECT_ANSWER';
const LIKE_ANSWER = 'voting/LIKE_ANSWER';
const DISLIKE_ANSWER = 'voting/DISLIKE_ANSWER';
const INIT_VOTES = 'voting/INIT_VOTES';
const VOTE_FOR_ANSWER = 'voting/VOTE_FOR_ANSWER';
const FETCH_QUESTIONS = 'voting/FETCH_QUESTIONS';
const FETCH_ANSWERS = 'voting/FETCH_ANSWERS';
const FETCH_WORLDVIEWS = 'voting/FETCH_WORLDVIEWS';

const initialState = Map();

export default function reducer(state = initialState, action = {}) {
  const activeQuestion = state.get('activeQuestion');
  const activeAnswer = state.getIn(['questions', activeQuestion, 'activeAnswer']);
  let activeAnswerIndex;
  let gotoAnswerIndex;
  let gotoAnswerId;
  if (activeAnswer) {
    activeAnswerIndex = state.getIn(['questions', activeQuestion, 'answers']).findIndex(item => item.get('id') === activeAnswer);
    if (state.getIn(['questions', activeQuestion, 'answers']).count() === activeAnswerIndex + 1) {
      gotoAnswerIndex = state.getIn(['questions', activeQuestion, 'answers']).findIndex(answer => answer.get('liked') === true);
    } else {
      gotoAnswerIndex =  activeAnswerIndex + 1;
    }
    gotoAnswerId = state.getIn(['questions', activeQuestion, 'answers', gotoAnswerIndex]).get('id');
  }

  switch (action.type) {
  case SELECT_QUESTION:
    return state.set('activeQuestion', action.payload);
  case SELECT_ANSWER:
    return state.setIn(['questions', activeQuestion, 'activeAnswer'], action.payload);
  case LIKE_ANSWER:
    return state
      .setIn(['questions', activeQuestion, 'answers', activeAnswerIndex, 'liked'], true)
      .setIn(['questions', activeQuestion, 'activeAnswer'], gotoAnswerId);
  case DISLIKE_ANSWER:
    return state
      .setIn(['questions', activeQuestion, 'answers', activeAnswerIndex, 'liked'], false)
      .setIn(['questions', activeQuestion, 'activeAnswer'], gotoAnswerId);
  case INIT_VOTES:
    return state.mergeDeepIn(['questions'], action.payload);
  case VOTE_FOR_ANSWER:
    const currentWorldviewId = state.getIn(['questions', activeQuestion, 'answers', activeAnswerIndex, 'worldviewId']);
    const currentVoteCount = state.getIn(['questions', activeQuestion, 'answers', activeAnswerIndex, 'voteCount']);
    const currentQuestionCount = state.getIn(['questions', activeQuestion, 'voteCount']);
    const currentWorldviewCount = state.getIn(['worldviews', currentWorldviewId, 'voteCount']);
    return state
      .setIn(['questions', activeQuestion, 'votedAnswer'], state.getIn(['questions', activeQuestion, 'answers', activeAnswerIndex, 'id']))
      .setIn(['questions', activeQuestion, 'answers', activeAnswerIndex, 'voteCount'], Number(currentVoteCount) + 1)
      .setIn(['questions', activeQuestion, 'voteCount'], Number(currentQuestionCount) + 1)
      .setIn(['worldviews', currentWorldviewId, 'voteCount'], Number(currentWorldviewCount) + 1);
  case FETCH_WORLDVIEWS:
    return state.set('worldviews', action.payload);
  case FETCH_QUESTIONS:
    return state.set('questions', action.payload);
  case FETCH_ANSWERS:
    const firstAnswerId = action.payload.getIn([0, 'id']);
    return state
      .setIn(['questions', activeQuestion, 'answers'], action.payload)
      .setIn(['questions', activeQuestion, 'activeAnswer'], firstAnswerId);
  default:
    return state;
  }
}

function voteForAnswerPromise(id) {
  return fetch(ownAddress + '/api/vote-for-answer?answerIdentifier=' + id, { method: 'put', credentials: 'include' }).then(response => response.json()).then(json => fromJS(json)).catch(error => console.error('MIDDLEWARE ERROR:', error));
}
function fetchQuestionsPromise() {
  return fetch(ownAddress + '/api/voprosy.json').then(response => response.json()).then(json => fromJS(json)).catch(error => console.error('MIDDLEWARE ERROR:', error));
}
function fetchAnswersPromise(path) {
  return fetch(ownAddress + '/api/voprosy/' + path + '.json').then(response => response.json()).then(json => fromJS(json)).catch(error => console.error('MIDDLEWARE ERROR:', error));
}
function fetchWorldviewsPromise() {
  return fetch(ownAddress + '/api/mirovozzreniya.json').then(response => response.json()).then(json => fromJS(json)).catch(error => console.error('MIDDLEWARE ERROR:', error));
}

export const selectQuestion = createAction(SELECT_QUESTION, id => id, id => {
  return {analytics: {type: 'reachGoal', payload: {target: 'SELECT_QUESTION', params: id} }};
});
export const selectAnswer = createAction(SELECT_ANSWER, id => id);
export const likeAnswer = createAction(LIKE_ANSWER);
export const dislikeAnswer = createAction(DISLIKE_ANSWER);
export const initVotes = createAction(INIT_VOTES, votes => {
  const votesMap = {};
  for (const key in votes) {
    if (votes.hasOwnProperty(key)) {
      votesMap[key] = {'votedAnswer': votes[key]};
    }
  }
  return fromJS(votesMap);
});
export const voteForAnswer = createAction(VOTE_FOR_ANSWER, async id => {
  return await voteForAnswerPromise(id);
}, id => {
  return {analytics: {type: 'reachGoal', payload: {target: 'VOTE_FOR_ANSWER', params: id} }};
});
export const fetchQuestions = createAction(FETCH_QUESTIONS, async () => {
  return await fetchQuestionsPromise();
});
export const fetchAnswers = createAction(FETCH_ANSWERS, async path => {
  return await fetchAnswersPromise(path);
});
export const fetchWorldviews = createAction(FETCH_WORLDVIEWS, async () => {
  return await fetchWorldviewsPromise();
});
