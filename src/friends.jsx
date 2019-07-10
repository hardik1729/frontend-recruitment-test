import React from 'react';
import axios from 'axios';
import Style from './App.scss';
import TOKEN from './token';

const axiosGitHubGraphQL = axios.create({
  baseURL: 'https://api.github.com/graphql',
  headers: {
    Authorization: `bearer ${
      TOKEN
    }`
  }
});

const searchFriends = `
  query SearchTop100Users($searchString: String!, $first: Int, $last: Int, $afterCursor: String, $beforeCursor: String) {
    search(query: $searchString, type: USER, first: $first, last: $last, after: $afterCursor, before: $beforeCursor) {
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      nodes {
        ... on User{
          login
          avatarUrl
          id
        }
      }
    }
  }
`;

const commitHistory = `
  query friendsCommitHistory($Author: CommitAuthor){
    history(author: $Author, first: 5){

    }
  }
`;

const initialPageInfo = {startCursor:null, endCursor:null, hasNextPage:null, hasPreviousPage:null};
class Friends extends React.Component {
  constructor() {
    super();
    this.state = {
      username: '',
      tempuser: '',
      search:false,
      matchedUsers: [],
      id:'',
      showCommit: false,
      searchCommit:false,
      commit:[],
      pageInfo: initialPageInfo,
      first: 100,
      last: null
    };
    this.onFetchFromGitHub = this.onFetchFromGitHub.bind(this);
    this.onFetchFromGitHubCommit = this.onFetchFromGitHubCommit.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.list = this.list.bind(this);
  }

  onFetchFromGitHub() {
    axiosGitHubGraphQL.post('', {
      query: searchFriends,
      variables:{
        searchString: this.state.username,
        afterCursor: this.state.pageInfo.endCursor,
        beforeCursor: this.state.pageInfo.startCursor,
        first: this.state.first,
        last: this.state.last
      }
    }).then(result =>{
      const dataWithLogin = result.data.data.search.nodes.filter(user => user.login);
      const filteredData = dataWithLogin.filter(user => user.login.toLowerCase().includes(this.state.username));
      this.setState({
        matchedUsers: filteredData,
        showCommit: false,
        search:false,
        commit:[],
        pageInfo: result.data.data.search.pageInfo
      });
    });
  }

  onFetchFromGitHubCommit() {
    axiosGitHubGraphQL.post('', {
      query: commitHistory,
      variables:{
        Author: {id : this.state.id}
      }
    }).then(result =>
      this.setState({
        commit: result.data.errors, //.history.nodes,
        olduser: this.state.username,
        id: ''
      })
    );
  }

  componentDidUpdate() {
    if (this.state.search) {
      this.onFetchFromGitHub();
    }
    if (this.state.id !== '' || this.state.searchCommit) {
      this.onFetchFromGitHubCommit();
    }
  }

  onChange(event) {
    this.setState({
      tempuser: event.target.value
    });
  }

  onSubmit(event) {
    this.setState({
      username: this.state.tempuser,
      first:100,
      search:true,
      last:null,
      pageInfo:initialPageInfo,
      matchedUsers: [],
      id:'',
      showCommit: false,
      commit:[]
    });
    event.preventDefault();
  }

  onClick(event) {
    if (event.currentTarget.dataset.id === 'next') {
      if (this.state.pageInfo.hasNextPage) {
        this.setState({
          pageInfo:{
            startCursor:null,
            endCursor:this.state.pageInfo.endCursor,
            hasNextPage:this.state.pageInfo.hasNextPage,
            hasPreviousPage:this.state.pageInfo.hasPreviousPage
          },
          first:100,
          last:null,
          search: this.state.pageInfo.hasNextPage
        });
        if (this.state.showCommit) {
          this.setState({
            searchCommit:true,
            search:false
          });
        }
      }

    } else if (event.currentTarget.dataset.id === 'prev') {
      if (this.state.pageInfo.hasPreviousPage) {
        this.setState({
          pageInfo:{
            startCursor:this.state.pageInfo.startCursor,
            endCursor:null,
            hasNextPage:this.state.pageInfo.hasNextPage,
            hasPreviousPage:this.state.pageInfo.hasPreviousPage
          },
          first:null,
          last:100,
          search: this.state.pageInfo.hasPreviousPage
        });
        if (this.state.showCommit) {
          this.setState({
            searchCommit:true,
            search:false
          });
        }
      }
    } else {
      this.setState({
        id: event.currentTarget.dataset.id,
        showCommit: true,
        pageInfo: initialPageInfo, first:100, last:null, search:false, commit:[]
      });
    }
  }
  list() {
    if (!this.state.showCommit) {
      return (this.state.matchedUsers.map(user => {
        return (
          <li data-id={user.id} onClick={this.onClick}>
            <img src={user.avatarUrl} height="30" width="30"/> {user.login}
          </li>
        );
      }));
    }
    return (this.state.commit.map(error => {
      return (
        <li>
          {error.message}
        </li>
      );
    }));
  }
  render() {

    return (
      <div className={Style.something}>
        <h1>Friends</h1>
        <form onSubmit={this.onSubmit}>
          <label>
            Username:
          </label>
          <input
            type="text"
            onChange={this.onChange}
            style={{width: '300px'}}
          />
          <button type="submit">Search</button>
        </form>
        <hr/>
        <div data-id="next" onClick={this.onClick}>next</div>
        <div data-id="prev" onClick={this.onClick}>prev</div>
        {
          this.list()
        }
      </div>
    );

  }
}

export default Friends;
