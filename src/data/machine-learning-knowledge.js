(function (root, factory) {
  const knowledgeData = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = knowledgeData;
  }

  if (root) {
    root.machineLearningKnowledge = knowledgeData;
    root.HttKnowledgeData = knowledgeData;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  return {
    futureNodes: [
      {
        id: "ensemble-methods",
        name: "Ensemble Methods"
      },
      {
        id: "representation-learning",
        name: "Representation Learning"
      },
      {
        id: "deep-learning",
        name: "Deep Learning"
      },
      {
        id: "large-language-models",
        name: "Large Language Models"
      }
    ],
    nodes: [
      {
        id: "linear-algebra",
        name: "Linear Algebra",
        tags: ["Mathematics", "Machine Learning Foundation"],
        description:
          "The study of vectors, matrices, linear transformations, and vector spaces. It provides the language used to represent datasets, model parameters, embeddings, and neural network layers.",
        importance:
          "Most machine learning systems store data and model operations as vectors and matrices, so linear algebra is a core foundation for understanding how models compute.",
        references: [
          {
            title: "Mathematics for Machine Learning",
            url: "https://mml-book.github.io/",
            type: "Book"
          },
          {
            title: "Introduction to Linear Algebra",
            url: "https://math.mit.edu/~gs/linearalgebra/",
            type: "Book"
          }
        ],
        status: "reviewed"
      },
      {
        id: "probability-theory",
        name: "Probability Theory",
        tags: ["Mathematics", "Statistics", "Machine Learning Foundation"],
        description:
          "A mathematical framework for reasoning about uncertainty, random variables, distributions, expectation, and conditional dependence.",
        importance:
          "Machine learning uses probability to model uncertain data, evaluate predictions, estimate risk, and reason about noisy observations.",
        references: [
          {
            title: "Pattern Recognition and Machine Learning",
            url: "https://www.microsoft.com/en-us/research/people/cmbishop/prml-book/",
            type: "Book"
          },
          {
            title: "Seeing Theory",
            url: "https://seeing-theory.brown.edu/",
            type: "Interactive explainer"
          }
        ],
        status: "reviewed"
      },
      {
        id: "calculus",
        name: "Calculus",
        tags: ["Mathematics", "Optimization"],
        description:
          "The study of change through derivatives, gradients, limits, and integrals. In machine learning it is most often used to understand how a loss changes as model parameters change.",
        importance:
          "Gradients make it possible to improve model parameters systematically instead of searching blindly.",
        references: [
          {
            title: "MIT OpenCourseWare Single Variable Calculus",
            url: "https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/",
            type: "Course"
          },
          {
            title: "Essence of Calculus",
            url: "https://www.3blue1brown.com/topics/calculus",
            type: "Video series"
          }
        ],
        status: "reviewed"
      },
      {
        id: "statistics",
        name: "Statistics",
        tags: ["Statistics", "Data Science"],
        description:
          "Methods for summarizing data, estimating unknown quantities, testing hypotheses, and measuring uncertainty from observations.",
        importance:
          "Statistics gives machine learning its language for generalization, sampling, estimation, bias, variance, and evaluation.",
        references: [
          {
            title: "The Elements of Statistical Learning",
            url: "https://hastie.su.domains/ElemStatLearn/",
            type: "Book"
          },
          {
            title: "OpenIntro Statistics",
            url: "https://www.openintro.org/book/os/",
            type: "Book"
          }
        ],
        status: "reviewed"
      },
      {
        id: "optimization",
        name: "Optimization",
        tags: ["Mathematics", "Algorithm", "Optimization"],
        description:
          "The study of choosing values that minimize or maximize an objective function under constraints.",
        importance:
          "Training a machine learning model is usually an optimization problem: find parameters that minimize prediction error while controlling complexity.",
        references: [
          {
            title: "Convex Optimization",
            url: "https://web.stanford.edu/~boyd/cvxbook/",
            type: "Book"
          },
          {
            title: "Numerical Optimization",
            url: "https://link.springer.com/book/10.1007/978-0-387-40065-5",
            type: "Book"
          }
        ],
        status: "reviewed"
      },
      {
        id: "gradient-descent",
        name: "Gradient Descent",
        tags: ["Algorithm", "Optimization", "Machine Learning"],
        description:
          "An iterative optimization method that updates parameters in the direction that most reduces a loss function locally.",
        importance:
          "Gradient descent and its variants are central to training linear models, neural networks, and many large-scale machine learning systems.",
        references: [
          {
            title: "Deep Learning, Chapter 8",
            url: "https://www.deeplearningbook.org/contents/optimization.html",
            type: "Book chapter"
          },
          {
            title: "An overview of gradient descent optimization algorithms",
            url: "https://arxiv.org/abs/1609.04747",
            type: "Survey"
          }
        ],
        status: "reviewed"
      },
      {
        id: "supervised-learning",
        name: "Supervised Learning",
        tags: ["Machine Learning", "Data Science"],
        description:
          "A learning setting where models are trained on input examples paired with known target labels or values.",
        importance:
          "Supervised learning powers many practical prediction systems, including classification, regression, ranking, and forecasting.",
        references: [
          {
            title: "An Introduction to Statistical Learning",
            url: "https://www.statlearning.com/",
            type: "Book"
          },
          {
            title: "The Elements of Statistical Learning",
            url: "https://hastie.su.domains/ElemStatLearn/",
            type: "Book"
          }
        ],
        status: "reviewed"
      },
      {
        id: "decision-trees",
        name: "Decision Trees",
        tags: ["Machine Learning", "Algorithm", "Interpretable Models"],
        description:
          "A supervised learning model that recursively splits data by feature conditions to make predictions through a tree of decisions.",
        importance:
          "Decision trees are intuitive, interpretable, and foundational for stronger ensemble methods such as random forests and gradient boosted trees.",
        references: [
          {
            title: "Classification and Regression Trees",
            url: "https://www.routledge.com/Classification-and-Regression-Trees/Breiman-Friedman-Olshen-Stone/p/book/9780412048418",
            type: "Book"
          },
          {
            title: "scikit-learn Decision Trees",
            url: "https://scikit-learn.org/stable/modules/tree.html",
            type: "Documentation"
          }
        ],
        status: "reviewed"
      },
      {
        id: "neural-networks",
        name: "Neural Networks",
        tags: ["Machine Learning", "Deep Learning"],
        description:
          "Parameterized models built from layers of simple differentiable functions that can learn complex mappings from data.",
        importance:
          "Neural networks are the foundation of modern deep learning systems for vision, language, speech, robotics, and scientific modeling.",
        references: [
          {
            title: "Deep Learning",
            url: "https://www.deeplearningbook.org/",
            type: "Book"
          },
          {
            title: "Neural Networks and Deep Learning",
            url: "http://neuralnetworksanddeeplearning.com/",
            type: "Book"
          }
        ],
        status: "reviewed"
      },
      {
        id: "backpropagation",
        name: "Backpropagation",
        tags: ["Machine Learning", "Deep Learning", "Algorithm"],
        description:
          "An efficient algorithm for computing gradients through layered differentiable models by applying the chain rule backward from the loss.",
        importance:
          "Backpropagation made practical training of multi-layer neural networks possible and remains a core mechanism in deep learning frameworks.",
        references: [
          {
            title: "Learning representations by back-propagating errors",
            url: "https://www.nature.com/articles/323533a0",
            type: "Paper"
          },
          {
            title: "Deep Learning, Chapter 6",
            url: "https://www.deeplearningbook.org/contents/mlp.html",
            type: "Book chapter"
          }
        ],
        status: "reviewed"
      }
    ],
    relationships: [
      {
        source: "probability-theory",
        target: "statistics",
        type: "prerequisite",
        note: "Statistical estimation and inference rely on probability models."
      },
      {
        source: "calculus",
        target: "optimization",
        type: "prerequisite",
        note: "Derivatives and gradients are central tools for continuous optimization."
      },
      {
        source: "linear-algebra",
        target: "optimization",
        type: "application",
        note: "Optimization methods often operate on vectors, matrices, and parameter spaces."
      },
      {
        source: "optimization",
        target: "gradient-descent",
        type: "prerequisite",
        note: "Gradient descent is a specific optimization method."
      },
      {
        source: "calculus",
        target: "gradient-descent",
        type: "prerequisite",
        note: "The method uses gradients to decide update directions."
      },
      {
        source: "linear-algebra",
        target: "supervised-learning",
        type: "prerequisite",
        note: "Training examples and model parameters are commonly represented as vectors and matrices."
      },
      {
        source: "probability-theory",
        target: "supervised-learning",
        type: "prerequisite",
        note: "Prediction, uncertainty, and loss functions often use probabilistic assumptions."
      },
      {
        source: "statistics",
        target: "supervised-learning",
        type: "prerequisite",
        note: "Generalization and evaluation are statistical questions."
      },
      {
        source: "statistics",
        target: "decision-trees",
        type: "prerequisite",
        note: "Splits and predictions depend on measures of data distribution and impurity."
      },
      {
        source: "supervised-learning",
        target: "decision-trees",
        type: "prerequisite",
        note: "Decision trees are usually introduced as supervised models."
      },
      {
        source: "supervised-learning",
        target: "neural-networks",
        type: "application",
        note: "Many neural networks are trained for supervised prediction tasks."
      },
      {
        source: "linear-algebra",
        target: "neural-networks",
        type: "prerequisite",
        note: "Layer computations are built from vector and matrix operations."
      },
      {
        source: "optimization",
        target: "neural-networks",
        type: "prerequisite",
        note: "Training neural networks means optimizing parameters against a loss."
      },
      {
        source: "gradient-descent",
        target: "neural-networks",
        type: "application",
        note: "Gradient-based optimizers are the usual way to train neural networks."
      },
      {
        source: "calculus",
        target: "backpropagation",
        type: "prerequisite",
        note: "Backpropagation is an efficient use of the chain rule."
      },
      {
        source: "gradient-descent",
        target: "backpropagation",
        type: "application",
        note: "Backpropagation supplies gradients used by gradient-based training."
      },
      {
        source: "neural-networks",
        target: "backpropagation",
        type: "prerequisite",
        note: "The algorithm is defined over layered differentiable models."
      },
      {
        source: "decision-trees",
        target: "ensemble-methods",
        type: "application",
        note: "Decision trees are commonly combined into stronger ensemble methods."
      },
      {
        source: "neural-networks",
        target: "representation-learning",
        type: "application",
        note: "Neural networks can learn useful intermediate representations from data."
      },
      {
        source: "backpropagation",
        target: "deep-learning",
        type: "application",
        note: "Deep learning systems rely on scalable gradient training through layered models."
      },
      {
        source: "backpropagation",
        target: "large-language-models",
        type: "application",
        note: "Large language models use gradient-based training through deep neural architectures."
      }
    ]
  };
});
