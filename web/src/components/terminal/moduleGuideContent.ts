import { ModuleGuideContent, defaultModuleGuideContent } from './ModuleGuide'

// IQ Meter Module Guide Content
export const iqMeterGuideContent: ModuleGuideContent = {
  moduleName: 'IQ Meter',
  overview: {
    description: 'The IQ Meter provides a real-time intelligence quotient score for market conditions, measuring the overall health and risk level of the crypto ecosystem. It aggregates multiple data streams to produce a single, actionable metric.',
    intelligenceType: 'Composite market intelligence score combining sentiment, volatility, liquidity, and on-chain metrics into a unified assessment.',
    questionsAnswered: [
      'What is the current overall market risk level?',
      'Are market conditions favorable for trading activity?',
      'How does current market intelligence compare to historical baselines?',
      'Which factors are contributing most to the current score?'
    ]
  },
  howToUse: {
    steps: [
      'Review the main IQ score displayed prominently at the top',
      'Check the component breakdown to understand which factors are driving the score',
      'Monitor the trend indicator to see if conditions are improving or deteriorating',
      'Use the historical chart to compare current conditions to past periods',
      'Set alerts for significant score changes if available'
    ],
    importantInputs: [
      'Time range selection for historical comparison',
      'Component weight adjustments (if customizable)',
      'Alert threshold settings'
    ],
    commonMistakes: [
      'Treating the IQ score as a buy/sell signal rather than a risk indicator',
      'Ignoring the component breakdown and focusing only on the aggregate score',
      'Not considering the trend direction alongside the absolute value'
    ]
  },
  understandingResults: {
    ...defaultModuleGuideContent.understandingResults,
    riskScores: 'IQ scores range from 0-100. Scores above 70 indicate favorable market conditions. Scores below 30 suggest elevated risk. The middle range (30-70) represents neutral conditions.',
    probabilityBands: 'The confidence band around the IQ score shows the range of likely values given current data uncertainty.'
  },
  dataAndConfidence: {
    liveDataDescription: 'Live IQ scores are calculated from real-time market data including price feeds, volume metrics, on-chain activity, and sentiment indicators.',
    syntheticDataDescription: 'When live data is unavailable, synthetic intelligence is used to preserve continuity and is weighted accordingly.',
    multiSourceAggregation: 'The IQ Meter aggregates data from multiple exchanges, blockchain networks, and sentiment sources to reduce single-source bias.',
    fallbackBehavior: 'If primary data sources are unavailable, the system uses cached values and synthetic projections while clearly indicating reduced confidence.'
  },
  importantNotes: defaultModuleGuideContent.importantNotes
}

// Prediction Engine Module Guide Content
export const predictionEngineGuideContent: ModuleGuideContent = {
  moduleName: 'Prediction Engine',
  overview: {
    description: 'The Prediction Engine uses machine learning models to analyze events, entities, tokens, and chains to generate risk predictions and probability assessments. It provides forward-looking intelligence based on pattern recognition and historical data.',
    intelligenceType: 'AI-powered predictive analytics for risk assessment, price direction, and anomaly detection across multiple dimensions.',
    questionsAnswered: [
      'What is the risk level associated with a specific event or transaction?',
      'Is this entity likely to be involved in manipulation?',
      'What is the predicted price direction for a token?',
      'What is the current pressure level on a specific blockchain?'
    ]
  },
  howToUse: {
    steps: [
      'Select the prediction type (Event, Entity, Token, Chain, or Batch)',
      'Enter the required parameters for your prediction request',
      'Submit the request and wait for the AI model to process',
      'Review the prediction result including confidence score and classification',
      'Check the prediction history to track patterns over time'
    ],
    importantInputs: [
      'Accurate input values for the prediction parameters',
      'Correct entity identifiers and chain names',
      'Relevant context data for better predictions'
    ],
    commonMistakes: [
      'Using incomplete or inaccurate input data',
      'Treating predictions as certainties rather than probabilities',
      'Not considering the confidence score when interpreting results',
      'Making decisions based on a single prediction without context'
    ]
  },
  understandingResults: {
    confidenceTiers: [
      { name: 'High Confidence (>80%)', description: 'Strong signal with multiple corroborating data points. Higher reliability.' },
      { name: 'Medium Confidence (50-80%)', description: 'Moderate signal strength. Consider additional validation.' },
      { name: 'Low Confidence (<50%)', description: 'Weak signal or limited data. Use with caution and seek additional sources.' },
      { name: 'Synthesized', description: 'Generated when live model is unavailable. Based on historical patterns.' }
    ],
    riskScores: 'Risk classifications are High, Medium, or Low. High risk indicates immediate attention needed. The numeric score provides granularity within each classification.',
    alertsVsConfirmations: 'Predictions are probabilistic assessments, not confirmations. Always validate with additional intelligence sources.'
  },
  dataAndConfidence: {
    liveDataDescription: 'Predictions are generated by the GhostQuant Champion Model, trained on historical blockchain data and continuously updated.',
    syntheticDataDescription: 'When live data is unavailable, synthetic intelligence is used to preserve continuity and is weighted accordingly.',
    multiSourceAggregation: 'The prediction engine considers multiple data dimensions including on-chain metrics, market data, and behavioral patterns.',
    fallbackBehavior: 'If the prediction service is unavailable, the system provides synthetic predictions based on historical patterns while indicating reduced confidence.'
  },
  importantNotes: [
    'Predictions are probabilistic assessments, not guarantees of future outcomes.',
    'This module provides informational and analytical intelligence only.',
    'Results should not be construed as financial or investment advice.',
    'Model accuracy varies based on market conditions and data availability.',
    'Always cross-reference predictions with other intelligence sources.'
  ]
}

// Risk Map Module Guide Content
export const riskMapGuideContent: ModuleGuideContent = {
  moduleName: 'Risk Map',
  overview: {
    description: 'The Risk Map provides a visual representation of risk distribution across the crypto ecosystem. It identifies hotspots, emerging threats, and areas of concern through geographic and network-based visualizations.',
    intelligenceType: 'Spatial and network risk intelligence showing threat distribution, concentration areas, and risk propagation patterns.',
    questionsAnswered: [
      'Where are the highest risk concentrations in the ecosystem?',
      'Which regions or networks show emerging threat patterns?',
      'How is risk distributed across different chains and protocols?',
      'Are there any new risk hotspots forming?'
    ]
  },
  howToUse: {
    steps: [
      'Review the overall risk map for high-level threat distribution',
      'Zoom into specific regions or networks of interest',
      'Click on risk markers to see detailed threat information',
      'Use filters to focus on specific risk types or severity levels',
      'Monitor the timeline to track risk evolution over time'
    ],
    importantInputs: [
      'Risk type filters (manipulation, exploit, anomaly)',
      'Severity threshold settings',
      'Time range for historical comparison',
      'Geographic or network focus area'
    ],
    commonMistakes: [
      'Focusing only on the highest risk areas while ignoring emerging patterns',
      'Not using filters to isolate specific threat types',
      'Ignoring the temporal dimension of risk evolution'
    ]
  },
  understandingResults: {
    ...defaultModuleGuideContent.understandingResults,
    riskScores: 'Risk intensity is shown through color coding: Red indicates critical risk, Orange indicates high risk, Yellow indicates moderate risk, and Green indicates low risk.',
    probabilityBands: 'Risk zones show the area of potential impact. Larger zones indicate greater uncertainty in risk localization.'
  },
  dataAndConfidence: {
    liveDataDescription: 'Risk data is sourced from real-time threat detection systems, on-chain monitoring, and security intelligence feeds.',
    syntheticDataDescription: 'When live data is unavailable, synthetic intelligence is used to preserve continuity and is weighted accordingly.',
    multiSourceAggregation: 'Risk assessments combine multiple detection systems and intelligence sources for comprehensive coverage.',
    fallbackBehavior: 'If live threat feeds are unavailable, the map displays historical risk patterns with synthetic projections.'
  },
  importantNotes: defaultModuleGuideContent.importantNotes
}

// Whale Intelligence Module Guide Content
export const whaleIntelligenceGuideContent: ModuleGuideContent = {
  moduleName: 'Whale Intelligence',
  overview: {
    description: 'Whale Intelligence tracks and analyzes large wallet movements, accumulation patterns, and distribution events. It provides insights into the behavior of significant market participants and their potential impact on prices.',
    intelligenceType: 'Large holder behavioral analytics including movement tracking, pattern recognition, and impact assessment.',
    questionsAnswered: [
      'Which large wallets are currently active?',
      'Are whales accumulating or distributing?',
      'What tokens are seeing significant whale activity?',
      'How might whale movements impact market prices?'
    ]
  },
  howToUse: {
    steps: [
      'Review the whale activity summary for recent significant movements',
      'Check the accumulation/distribution indicators for trend direction',
      'Explore individual whale profiles for detailed behavior analysis',
      'Monitor the connections tab to understand wallet relationships',
      'Set alerts for specific whale addresses or movement thresholds'
    ],
    importantInputs: [
      'Minimum transaction size threshold',
      'Token or chain filters',
      'Time range for activity analysis',
      'Specific wallet addresses to track'
    ],
    commonMistakes: [
      'Assuming all whale movements indicate market direction',
      'Not considering the context of movements (exchange transfers, etc.)',
      'Treating whale activity as a direct trading signal',
      'Ignoring the confidence indicators on whale identification'
    ]
  },
  understandingResults: {
    confidenceTiers: [
      { name: 'Confirmed Whale', description: 'Verified large holder with consistent activity patterns and known history.' },
      { name: 'Probable Whale', description: 'Large holder identification based on transaction patterns. High confidence.' },
      { name: 'Potential Whale', description: 'Emerging large holder or uncertain identification. Moderate confidence.' },
      { name: 'Synthetic Profile', description: 'Generated when live tracking is unavailable. Based on historical patterns.' }
    ],
    riskScores: 'Impact scores indicate the potential market effect of whale movements. Higher scores suggest greater potential price impact.',
    alertsVsConfirmations: 'Whale alerts indicate significant activity. Confirmations require multiple corroborating signals.'
  },
  dataAndConfidence: {
    liveDataDescription: 'Whale data is sourced from real-time blockchain monitoring, exchange flow analysis, and wallet clustering algorithms.',
    syntheticDataDescription: 'When live data is unavailable, synthetic intelligence is used to preserve continuity and is weighted accordingly.',
    multiSourceAggregation: 'Whale identification combines on-chain analysis, exchange data, and behavioral pattern recognition.',
    fallbackBehavior: 'If live tracking is unavailable, the system displays historical whale profiles with synthetic activity projections.'
  },
  importantNotes: [
    'Whale identification is probabilistic and may not always be accurate.',
    'This module provides informational and analytical intelligence only.',
    'Results should not be construed as financial or investment advice.',
    'Whale movements do not guarantee price direction.',
    'Always consider multiple factors when interpreting whale activity.'
  ]
}

// Strategy Backtester Module Guide Content
export const strategyBacktesterGuideContent: ModuleGuideContent = {
  moduleName: 'Strategy Backtester',
  overview: {
    description: 'The Strategy Backtester allows you to test trading strategies against historical data to evaluate their potential performance. It provides detailed metrics including returns, risk measures, and trade statistics.',
    intelligenceType: 'Historical strategy simulation and performance analytics for strategy validation and optimization.',
    questionsAnswered: [
      'How would this strategy have performed historically?',
      'What is the risk-adjusted return of this strategy?',
      'What is the maximum drawdown I should expect?',
      'How many trades does this strategy generate?'
    ]
  },
  howToUse: {
    steps: [
      'Define your strategy parameters (entry/exit rules, position sizing)',
      'Select the historical time period for backtesting',
      'Choose the assets or markets to test against',
      'Run the backtest and wait for results',
      'Analyze the performance metrics and trade history',
      'Iterate on strategy parameters to optimize performance'
    ],
    importantInputs: [
      'Strategy entry and exit conditions',
      'Position sizing and risk management rules',
      'Historical time period selection',
      'Asset selection and market conditions'
    ],
    commonMistakes: [
      'Overfitting strategies to historical data',
      'Ignoring transaction costs and slippage',
      'Testing on too short a time period',
      'Not considering different market conditions',
      'Assuming past performance guarantees future results'
    ]
  },
  understandingResults: {
    confidenceTiers: [
      { name: 'Robust Results', description: 'Strategy tested across multiple market conditions with consistent performance.' },
      { name: 'Conditional Results', description: 'Strategy performs well in specific conditions. May not generalize.' },
      { name: 'Limited Data', description: 'Insufficient historical data for reliable conclusions.' },
      { name: 'Synthetic Backtest', description: 'Generated when live data is unavailable. Based on synthetic market data.' }
    ],
    riskScores: 'Key metrics include Total Return, Sharpe Ratio (risk-adjusted return), Maximum Drawdown (worst peak-to-trough decline), and Win Rate (percentage of profitable trades).',
    probabilityBands: 'Performance ranges show the distribution of possible outcomes based on historical variance.'
  },
  dataAndConfidence: {
    liveDataDescription: 'Backtests use historical market data including OHLCV prices, volume, and on-chain metrics where available.',
    syntheticDataDescription: 'When live data is unavailable, synthetic intelligence is used to preserve continuity and is weighted accordingly.',
    multiSourceAggregation: 'Historical data is aggregated from multiple exchanges and sources for comprehensive coverage.',
    fallbackBehavior: 'If historical data is unavailable for certain periods, the system uses synthetic data generation while indicating reduced confidence.'
  },
  importantNotes: [
    'Past performance does not guarantee future results.',
    'Backtests do not account for all real-world trading conditions.',
    'This module provides informational and analytical intelligence only.',
    'Results should not be construed as financial or investment advice.',
    'Always paper trade strategies before deploying real capital.',
    'Consider transaction costs, slippage, and market impact in real trading.'
  ]
}

// Export a helper function to get content by module name
export function getModuleGuideContent(moduleName: string): ModuleGuideContent {
  const contentMap: Record<string, ModuleGuideContent> = {
    'IQ Meter': iqMeterGuideContent,
    'Prediction Engine': predictionEngineGuideContent,
    'Prediction Console': predictionEngineGuideContent,
    'Risk Map': riskMapGuideContent,
    'Whale Intelligence': whaleIntelligenceGuideContent,
    'Strategy Backtester': strategyBacktesterGuideContent
  }

  return contentMap[moduleName] || {
    moduleName,
    overview: {
      description: `The ${moduleName} module provides specialized intelligence and analytics for the GhostQuant platform.`,
      intelligenceType: 'Specialized analytics and intelligence for crypto market analysis.',
      questionsAnswered: [
        'What insights does this module provide?',
        'How can I use this intelligence effectively?',
        'What data sources inform this analysis?'
      ]
    },
    ...defaultModuleGuideContent
  }
}
