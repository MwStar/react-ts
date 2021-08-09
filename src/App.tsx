import React from 'react';

import './app.less';
import Header from 'Components/Header';

interface IProps {
  name: string;
  age: number;
}

function App(props: IProps) {
  const { name, age } = props;
  // eslint-disable-next-line unicorn/consistent-function-scoping
  function go() {
    console.log('11111111');
  }

  return (
    <div className="app">
      <Header />
      <span onClick={go}>{`Hello! I'm ${name}, ${age} years old12.`}</span>
    </div>
  );
}

export default App;
