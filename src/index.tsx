/* eslint-disable unicorn/prefer-module */
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

//  webpack5 必须写这段代码 才可以 热更新
if ((module as any) && module.hot) {
  module.hot.accept();
}

ReactDOM.render(<App name="liangli" age={10} />, document.querySelector('#root'));
