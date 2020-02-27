import React from 'react';

const Auth = React.createContext({
  authState: 'login',
  logout: () => { },
  user: {},
});
