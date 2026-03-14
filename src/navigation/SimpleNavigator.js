import React, {useState, createContext, useContext, useEffect} from 'react';

const NavigationContext = createContext();

const formatTitle = (routeName) => `BusKá - ${routeName}`;

export const NavigationProvider = ({children, initialRoute = 'Login'}) => {
  const [currentRoute, setCurrentRoute] = useState(initialRoute);
  const [routeParams, setRouteParams] = useState({});
  const [history, setHistory] = useState([{route: initialRoute, params: {}}]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = formatTitle(currentRoute);
    }
  }, [currentRoute]);

  const navigate = (routeName, params = {}) => {
    setCurrentRoute(routeName);
    setRouteParams(params);
    setHistory([...history, {route: routeName, params}]);
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const previous = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentRoute(previous.route);
      setRouteParams(previous.params || {});
    }
  };

  const value = {
    currentRoute,
    routeParams,
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
  const {currentRoute, routeParams} = useNavigation();

  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.props.name === currentRoute) {
          return React.cloneElement(child, {routeParams});
        }
        return null;
      })}
    </>
  );
};

export const Screen = ({name, component: Component, routeParams: screenParams}) => {
  const {navigate, goBack, canGoBack, routeParams} = useNavigation();
  
  // Usa os params do screen se disponíveis, senão usa os do contexto
  const params = screenParams !== undefined ? screenParams : routeParams;
  
  // Cria objeto navigation compatível com React Navigation
  const navigation = {
    navigate: (routeName, navParams) => navigate(routeName, navParams || {}),
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

  // Cria objeto route compatível com React Navigation
  const route = {
    params: params || {},
    name: name,
  };

  return <Component navigation={navigation} route={route} />;
};

