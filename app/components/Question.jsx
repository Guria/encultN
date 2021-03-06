import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import QuestionVoting from 'components/QuestionVoting/QuestionVoting';
import QuestionResults from 'components/QuestionResults/QuestionResults';
import * as actionCreators from 'redux/modules/voting';
import puttext from 'i18n/index';

@connect(state => ({
  question: state.voting.get('questions').find(item => item.get('id') === state.voting.get('activeQuestion')),
}), actionCreators)
export default class Question extends Component {
  static propTypes = {
    question: PropTypes.object.isRequired,
    selectQuestion: PropTypes.func.isRequired,
    selectAnswer: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
  }

  render() {
    const __ = puttext();
    const loadingScreen = (
      <div className='fixed-width'>
        {(<div className='Loader'>{__('Минуточку...')} <i className='icon-spinner animate-spin' /></div>)}
      </div>
    );

    const mainScreen = (
      <div className='QuestionHeader'>
        <div className='fixed-width'>
          <h2 className='mdl-typography--headline-color-contrast'>{this.props.question.get('title')}</h2>
          <h3 className='mdl-typography--body-1-color-contrast'>{this.props.question.get('subTitle')}</h3>
        </div>
        {this.props.question.get('votedAnswer') ? <QuestionResults lang={this.props.params.lang} /> : <QuestionVoting lang={this.props.params.lang} />}
      </div>
    );

    return (
      <div>
        {this.props.question.get('answers') ? mainScreen : loadingScreen}
      </div>
    );
  }
}
