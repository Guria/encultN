import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

@connect(state => ({
  worldviews: state.voting.get('worldviews'),
}))
export default class Stats extends Component {
  static propTypes = {
    worldviews: PropTypes.object.isRequired,
  }

  render() {
    const worldviews = this.props.worldviews ? this.props.worldviews.sort((a, b) => a.get('voteCount') < b.get('voteCount')).map(worldview => {
      return (
        <tr>
          <td>{worldview.get('title')}</td>
          <td>{worldview.get('voteCount')}</td>
        </tr>
      );
    }) : '';

    return (
      <div className='FullStats marginTop-double'>
        <div className='row'>
          <div className='medium-10 medium-offset-1 large-8 large-offset-2 columns fixed-width'>
          <h1 className='marginVertical-double mdl-typography--display-1-color-contrast'>Статистика</h1>
          <table className='Table'>
            <tr>
              <th>Мировоззрение</th>
              <th><i className='icon-check'></i></th>
            </tr>
            {worldviews}
          </table>
          </div>
        </div>
      </div>
    );
  }
}