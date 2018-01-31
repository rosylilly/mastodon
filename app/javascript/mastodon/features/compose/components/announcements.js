import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import IconButton from '../../../components/icon_button';

export default class Announcements extends React.PureComponent {

  static propTypes = {
    announcements: ImmutablePropTypes.list.isRequired,
    nicotta: ImmutablePropTypes.list.isRequired,
    visible: PropTypes.bool.isRequired,
    onNicoru: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
  }

  handleNicoru (id) {
    return () => {
      this.props.onNicoru(id);
    };
  }

  render () {
    const { announcements, visible, nicotta, onToggle } = this.props;
    const caretClass = visible ? 'fa fa-caret-down' : 'fa fa-caret-up';
    return (
      <div className='announcements'>
        <div className='compose__extra__header'>
          <i className='fa fa-bell' />
          お知らせ
          <button className='compose__extra__header__icon' onClick={onToggle} >
            <i className={caretClass} />
          </button>
        </div>
        { visible && (
          <ul>
            {announcements.map((announcement, idx) => (
              <li key={idx}>
                <div className='announcements__icon'>
                  <IconButton
                    active={nicotta.includes(announcement.get('id'))}
                    animate
                    icon='nicoru--status'
                    title='announcement-icon'
                    onClick={this.handleNicoru(announcement.get('id'))}
                    activeStyle={{ color: '#ca8f04' }}
                  />
                </div>
                <div className='announcements__body'>
                  <p>{announcement.get('body')}</p>
                  <div className='links'>
                    {announcement.get('links').map((link, i) => (
                      <a href={link.get('url')} target='_blank' key={i}>
                        {link.get('text')}
                      </a>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

}
