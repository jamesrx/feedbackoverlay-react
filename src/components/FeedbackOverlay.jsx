import React from 'react';
import Thumb from './Thumb';
import style from '../styles/FeedbackOverlay.scss';

class FeedbackOverlay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hideOverlay: false,
      isValidDomain: false,
      fromDate: '',
      toDate: '',
      thumbsUp: 0,
      thumbsDown: 0,
      comments: [],
      commentsExpanded: false,
    };
    this.cachedRequests = {};
    this.docId = '';
  }

  componentDidMount = () => {
    // save the doc ID upfront for use when we make requests
    this.docId = window.location.pathname.split('-').pop();

    // immediately load any saved settings into state on app startup
    chrome.storage.local.get(null, (settings) => { // eslint-disable-line no-undef
      this.setState(settings);
      if (settings.domains) this.checkDomainIsValid(settings.domains);
      this.fetchData();
    });

    // listen for setting changes and load those on change
    chrome.storage.onChanged.addListener(this.reloadSettings); // eslint-disable-line no-undef
  }

  reloadSettings = (settings) => {
    // only one setting can change at a time, so get first index from the array
    const key = Object.keys(settings)[0];

    // update state with the new setting value
    this.setState({ [key]: settings[key].newValue });

    if (settings.domains) {
      // domain settings have changed, so re-check domain
      this.checkDomainIsValid(settings.domains.newValue);
    } else if (settings.fromDate || settings.toDate) {
      // if a date has been updated, fetch new data for those dates
      this.fetchData();
    }
  }

  fetchData = () => {
    const { fromDate, toDate } = this.state;
    const dates = {
      fromDate: new Date(fromDate).getTime(),
      toDate: new Date(toDate).getTime(),
    };

    const queryString = Object.keys(dates)
      // filter out falsey values from dates
      .filter(key => dates[key])
      .reduce((acc, key) => (
        // if a date has been set in settings, add it to the querystring
        `${acc}&${key}=${dates[key]}`
      ), `?docId=${this.docId}`);

    const cachedRequest = this.cachedRequests[queryString];

    if (cachedRequest) {
      // if request has been done before, use data from cache
      this.parseFeedback(cachedRequest);
    } else {
      fetch(`https://selene-prod-us-east-1.internal1.continual.app.prod.aws.dotdash.com/ugc/feedback/search${queryString}`)
        .then(response => response.json())
        .then((data) => {
          // first request for this data, so save in cache
          this.cachedRequests[queryString] = data;
          this.parseFeedback(data);
        });
    }
  }

  parseFeedback = (data) => {
    let thumbsUpCount = 0;
    let thumbsDownCount = 0;
    const comments = {};

    data.data.list.forEach((item) => {
      if (item.thumbsSignal === 'THUMBS_UP') {
        thumbsUpCount += 1;
      } else {
        thumbsDownCount += 1;

        // increment count if comment exists, or add new comment and set count to 1
        if (comments[item.comment]) {
          comments[item.comment].count += 1;
        } else {
          comments[item.comment] = { count: 1 };
        }

        // save created time for sorting
        comments[item.comment].created = item.created;
      }
    });

    let commentList = Object.keys(comments);

    if (commentList.length) {
      // sort by newest first
      commentList.sort((a, b) => comments[b].created - comments[a].created);

      // save list of jsx to display for comments
      commentList = commentList.map(comment => (
        <li>
          {`${comment} ${comments[comment].count > 1 ? `(x${comments[comment].count})` : ''}`}
        </li>
      ));
    }

    this.setState({
      thumbsUp: thumbsUpCount,
      thumbsDown: thumbsDownCount,
      comments: commentList,
    });
  }

  checkDomainIsValid = (domains) => {
    const isValid = Object.keys(domains).some((domain) => {
      if (window.location.hostname.indexOf(domain) !== -1) {
        return domains[domain];
      }

      return false;
    });

    this.setState({ isValidDomain: isValid });
  }

  getColor = (thumbsUp, thumbsDown) => {
    // value is from 0 to 1 (0 == red, 1 == green)
    const value = thumbsUp / (thumbsUp + thumbsDown);
    const hue = value * 120;

    return `hsl(${hue}, 100%, 45%)`;
  }

  toggleComments = () => {
    this.setState(prevState => ({ commentsExpanded: !prevState.commentsExpanded }));
  }

  render() {
    const {
      hideOverlay,
      isValidDomain,
      commentsExpanded,
      thumbsUp,
      thumbsDown,
      comments,
    } = this.state;
    const displayOverlay = hideOverlay || !isValidDomain ? 'none' : 'block';
    const displayComments = commentsExpanded && thumbsDown ? 'block' : 'none';
    const displayCommentToggle = thumbsDown ? 'block' : 'none';
    const rating = Math.round((thumbsUp / (thumbsUp + thumbsDown)) * 1000) / 10 || 0;
    const ratingColor = this.getColor(thumbsUp, thumbsDown);

    return (
      <div className={style.root} style={{ display: displayOverlay }}>
        <ul className={style.comments} style={{ display: displayComments }}>
          {comments}
        </ul>
        <div className={style.rating} style={{ color: ratingColor }}>
          {rating}
        </div>
        <Thumb
          count={thumbsUp}
        />
        <Thumb
          className="thumbsDown"
          count={thumbsDown}
        >
          <button
            type="button"
            className={style.expandComment}
            style={{ display: displayCommentToggle }}
            onClick={this.toggleComments}
          >
            [
            <span className={style.expandCommentIcon}>
              {commentsExpanded ? '-' : '+'}
            </span>
            ]
          </button>
        </Thumb>
      </div>
    );
  }
}

export default FeedbackOverlay;
