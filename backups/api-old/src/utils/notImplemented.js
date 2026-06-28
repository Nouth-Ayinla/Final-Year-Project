function notImplemented(routeName) {
  return (req, res) => {
    res.status(501).json({
      route: routeName,
      message: 'Route scaffolded but not implemented yet.',
    });
  };
}

module.exports = { notImplemented };
