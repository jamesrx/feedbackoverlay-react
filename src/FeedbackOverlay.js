import React from 'react';

class ThumbCount extends React.Component {
    render() {
        const className = `feedback-overlay__thumb--${this.props.suffix}`;

        return (
            <div className={`feedback-overlay__thumb ${className}`}>
                {this.props.children}
                <span className={`${className}-count`}>{this.props.count}</span>
            </div>
        );
    }
}

class FeedbackOverlay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hideOverlay: false,
            domains: {},
            isValidDomain: false,
            fromDate: '',
            toDate: '',
            thumbsUp: 0,
            thumbsDown: 0,
            comments: [],
            commentsExpanded: false
        };
        this.cachedRequests = {};
        this.docId = ''
    }

    componentDidMount = () => {
        this.docId = window.location.pathname.split('-').pop(); // save the doc ID upfront for use when we make requests

        // immediately load any saved settings into state on app startup
        chrome.storage.local.get(null, settings => { // eslint-disable-line no-undef
            this.setState(settings);
            this.checkDomainIsValid(this.state.domains);
            this.fetchData();
        });

        // listen for setting changes and load those on change
        chrome.storage.onChanged.addListener(this.reloadSettings); // eslint-disable-line no-undef
    }

    reloadSettings = (settings) => {
        const key = Object.keys(settings)[0]; // only one setting can change at a time, so get first index from the array
        this.setState({[key]: settings[key].newValue}); // update state with the new setting value

        if (settings.domains) {
            this.checkDomainIsValid(this.state.domains); // domain settings have changed, so re-check domain
        } else if (settings.fromDate || settings.toDate) {
            this.fetchData(); // if a date has been updated, fetch new data for those dates
        }
    }

    fetchData = () => {
        const dates = {
            fromDate: new Date(this.state.fromDate).getTime(),
            toDate: new Date(this.state.toDate).getTime()
        };
        let queryString = '?docId=' + this.docId;
    
        for (const key in dates) {
            if (dates[key]) {
                queryString += `&${key}=${dates[key]}`; // if a date has been set in settings, add it to the querystring
            }
        }

        const cachedRequest = this.cachedRequests[queryString];

        if (cachedRequest) {
            this.parseFeedback(cachedRequest); // if request has been done before, use data from cache
        } else {
            fetch('https://*' + queryString)
                .then(response => response.json())
                .then(data => {
                    this.cachedRequests[queryString] = data; // first request for this data, so save in cache
                    this.parseFeedback(data);
                });
        }
    }

    parseFeedback = (data) => {
        let thumbsUpCount = 0;
        let thumbsDownCount = 0;
        const comments = {};
        
        data.data.list.forEach(item => {
            if (item.thumbsSignal === 'THUMBS_UP') {
                thumbsUpCount++;
            } else {
                thumbsDownCount++;
                comments[item.comment] ? comments[item.comment].count++ : comments[item.comment] = {count: 1}; // increment count if comment exists, or add new comment and set count to 1
                comments[item.comment].created = item.created; // save created time for sorting
            }
        });
        
        const commentKeys = Object.keys(comments);
        const commentList = [];

        if (commentKeys.length) {
            commentKeys.sort((a, b) => comments[b].created > comments[a].created); // sort by newest first
            commentKeys.forEach(comment => {
                commentList.push(`${comment} ${comments[comment].count > 1 ? `(x${comments[comment].count})` : ''}`); // save text to display for comments
            });
        }

        this.setState({
            thumbsUp: thumbsUpCount,
            thumbsDown: thumbsDownCount,
            comments: commentList
        });
    }

    checkDomainIsValid = (domains) => {
        let isValid = false;

        for (const domain in domains) {
            if (window.location.hostname.indexOf(domain) !== -1) {
                isValid = domains[domain];
                break;
            }
        }

        this.setState({isValidDomain: isValid});
    }

    getColor = (thumbsUp, thumbsDown) => {
        const value = thumbsUp / (thumbsUp + thumbsDown); // value is from 0 to 1 (0 == red, 1 == green)
        const hue = value * 120;

        return `hsl(${hue}, 100%, 45%)`;
    }

    toggleComments = () => {
        this.setState((prevState) => {
            return {
                commentsExpanded: !prevState.commentsExpanded
            };
        });
    }

    render() {
        const displayOverlay = this.state.hideOverlay || !this.state.isValidDomain ? 'none' : 'block';
        const displayComments = this.state.commentsExpanded ? 'block' : 'none';
        const rating = Math.round((this.state.thumbsUp / (this.state.thumbsUp + this.state.thumbsDown)) * 1000) / 10 || 0;
        const ratingColor = this.getColor(this.state.thumbsUp, this.state.thumbsDown);
        const displayCommentToggle = this.state.thumbsDown ? 'block' : 'none';

        return (
            <div id="feedback-overlay" style={{display: displayOverlay}}>
                <ul className="feedback-overlay__comments" style={{display: displayComments}}>
                    {this.state.comments.map(comment => <li>{comment}</li>)}
                </ul>
                <div className="feedback-overlay__rating" style={{color: ratingColor}}>
                    {rating}
                </div>
                <ThumbCount
                    suffix="up"
                    count={this.state.thumbsUp}
                />
                <ThumbCount
                    suffix="down"
                    count={this.state.thumbsDown}>
                    <span className="feedback-overlay__expand-comment" style={{display: displayCommentToggle}} onClick={this.toggleComments}>
                        [<span className="feedback-overlay__expand-comment-icon">
                            {this.state.commentsExpanded ? '-' : '+'}
                        </span>]
                    </span>
                </ThumbCount>
            </div>
        );
    }
}

export default FeedbackOverlay;
