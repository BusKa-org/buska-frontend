import React, {useState, createContext, useContext} from 'react';

const NavigationContext = createContext();

export const NavigationProvider = ({children, initialRoute = 'Login'}) => {
  const [currentRoute, setCurrentRoute] = useState(initialRoute);
  const [history, setHistory] = useState([initialRoute]);

  const navigate = (routeName) => {
    setCurrentRoute(routeName);
    setHistory([...history, routeName]);
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      setHistory(newHistory);
      setCurrentRoute(newHistory[newHistory.length - 1]);
    }
  };

  const value = {
    currentRoute,
    navigate,
    goBack,
    canGoBack: history.length > 1,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

export const Navigator = ({children, initialRoute}) => {
  const {currentRoute} = useNavigation();

  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.props.name === currentRoute) {
          return child;
        }
        return null;
      })}
    </>
  );
};

export const Screen = ({name, component: Component}) => {
  const {navigate, goBack, canGoBack} = useNavigation();
  
  // Cria objeto navigation compatível com React Navigation
  const navigation = {
    navigate: (routeName) => navigate(routeName),
    goBack: () => goBack(),
    canGoBack: () => canGoBack,
    // Métodos adicionais que podem ser usados
    reset: (state) => {
      // Implementação básica de reset
      if (state?.routes && state.routes.length > 0) {
        navigate(state.routes[state.index || 0].name);
      }
    },
  };

  return <Component navigation={navigation} />;
};

