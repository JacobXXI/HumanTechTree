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
    futureNodes: [],
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
      },
      {
        id: "discrete-mathematics",
        name: "Discrete Mathematics",
        tags: ["Mathematics", "Computer Science"],
        description:
          "The study of countable structures such as sets, relations, logic, combinatorics, and proof techniques used to reason about finite systems.",
        importance:
          "Discrete mathematics underpins algorithms, data structures, graphs, programming languages, cryptography, and many models of computation.",
        references: [
          {
            title: "MIT OpenCourseWare Mathematics for Computer Science",
            url: "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/",
            type: "Course"
          }
        ],
        status: "reviewed"
      },
      {
        id: "graph-theory",
        name: "Graph Theory",
        tags: ["Mathematics", "Computer Science", "Networks"],
        description:
          "A branch of mathematics that models relationships with vertices and edges, including trees, paths, cycles, networks, and connectivity.",
        importance:
          "Graphs provide a compact language for representing dependencies, search spaces, networks, computation flows, and many knowledge structures.",
        references: [
          {
            title: "Graph Theory",
            url: "https://diestel-graph-theory.com/",
            type: "Book"
          }
        ],
        status: "reviewed"
      },
      {
        id: "algorithms",
        name: "Algorithms",
        tags: ["Computer Science", "Algorithm"],
        description:
          "Finite, precise procedures for solving computational problems, transforming inputs into outputs, or making decisions step by step.",
        importance:
          "Algorithms turn mathematical ideas into repeatable methods and make it possible to compare solutions by correctness, efficiency, and scalability.",
        references: [
          {
            title: "Introduction to Algorithms",
            url: "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/",
            type: "Book"
          }
        ],
        status: "reviewed"
      },
      {
        id: "data-structures",
        name: "Data Structures",
        tags: ["Computer Science", "Programming"],
        description:
          "Ways of organizing data in memory or storage so that operations such as lookup, insertion, deletion, and traversal can be performed efficiently.",
        importance:
          "Data structures make algorithms practical by matching the representation of information to the operations a system needs to perform.",
        references: [
          {
            title: "Open Data Structures",
            url: "https://opendatastructures.org/",
            type: "Book"
          }
        ],
        status: "reviewed"
      },
      {
        id: "programming-languages",
        name: "Programming Languages",
        tags: ["Computer Science", "Software Engineering"],
        description:
          "Formal languages and execution models used to express algorithms, manage abstraction, control state, and build software systems.",
        importance:
          "Programming languages make algorithms executable and shape how people design, verify, maintain, and scale technological systems.",
        references: [
          {
            title: "Crafting Interpreters",
            url: "https://craftinginterpreters.com/",
            type: "Book"
          }
        ],
        status: "reviewed"
      },
      {
        id: "computer-architecture",
        name: "Computer Architecture",
        tags: ["Computer Science", "Computing Hardware"],
        description:
          "The design of computer processors, memory systems, instruction sets, and input-output structures that determine how software runs on hardware.",
        importance:
          "Architecture choices constrain speed, energy use, memory access, parallelism, and the feasibility of large-scale computation.",
        references: [
          {
            title: "Computer Organization and Design RISC-V Edition",
            url: "https://www.elsevier.com/books/computer-organization-and-design-risc-v-edition/patterson/9780128203316",
            type: "Book"
          }
        ],
        status: "reviewed"
      },
      {
        id: "parallel-computing",
        name: "Parallel Computing",
        tags: ["Computer Science", "Computing Systems"],
        description:
          "The practice of dividing computation across multiple processing units so work can proceed concurrently.",
        importance:
          "Parallel computing makes large simulations, data processing pipelines, scientific workloads, and machine learning training feasible at useful scales.",
        references: [
          {
            title: "Introduction to Parallel Computing Tutorial",
            url: "https://hpc.llnl.gov/documentation/tutorials/introduction-parallel-computing-tutorial",
            type: "Tutorial"
          }
        ],
        status: "reviewed"
      },
      {
        id: "gpu-computing",
        name: "GPU Computing",
        tags: ["Computing Hardware", "Parallel Computing", "Machine Learning Infrastructure"],
        description:
          "The use of graphics processing units for general-purpose, massively parallel numerical computation.",
        importance:
          "GPU computing accelerates matrix operations and tensor workloads, making modern deep learning and many scientific simulations practical.",
        references: [
          {
            title: "CUDA C++ Programming Guide",
            url: "https://docs.nvidia.com/cuda/cuda-c-programming-guide/",
            type: "Documentation"
          }
        ],
        status: "reviewed"
      },
      {
        id: "information-theory",
        name: "Information Theory",
        tags: ["Mathematics", "Statistics", "Communication"],
        description:
          "A mathematical theory of information, entropy, compression, coding, and communication over noisy channels.",
        importance:
          "Information theory provides tools for reasoning about uncertainty, representation, compression, prediction, and limits on communication.",
        references: [
          {
            title: "Elements of Information Theory",
            url: "https://onlinelibrary.wiley.com/doi/book/10.1002/047174882X",
            type: "Book"
          }
        ],
        status: "reviewed"
      },
      {
        id: "numerical-methods",
        name: "Numerical Methods",
        tags: ["Mathematics", "Computing", "Optimization"],
        description:
          "Algorithms for approximating mathematical operations such as solving equations, optimizing functions, integrating systems, and computing with finite precision.",
        importance:
          "Numerical methods make continuous mathematics executable on real computers, where exact symbolic answers are often unavailable or impractical.",
        references: [
          {
            title: "Fundamentals of Numerical Computation",
            url: "https://fncbook.com/",
            type: "Book"
          }
        ],
        status: "reviewed"
      },
      {
        id: "automatic-differentiation",
        name: "Automatic Differentiation",
        tags: ["Mathematics", "Algorithm", "Machine Learning Infrastructure"],
        description:
          "A family of techniques for computing derivatives of programs by propagating derivative information through elementary operations.",
        importance:
          "Automatic differentiation powers modern machine learning frameworks by making gradient computation reliable, efficient, and composable.",
        references: [
          {
            title: "Automatic Differentiation in Machine Learning: A Survey",
            url: "https://jmlr.org/papers/v18/17-468.html",
            type: "Survey"
          }
        ],
        status: "reviewed"
      },
      {
        id: "linear-regression",
        name: "Linear Regression",
        tags: ["Statistics", "Machine Learning", "Interpretable Models"],
        description:
          "A supervised modeling method that estimates a linear relationship between input variables and a numeric target.",
        importance:
          "Linear regression is a fundamental baseline for prediction, statistical inference, model evaluation, and understanding more complex supervised methods.",
        references: [
          {
            title: "An Introduction to Statistical Learning",
            url: "https://www.statlearning.com/",
            type: "Book"
          }
        ],
        status: "reviewed"
      },
      {
        id: "bayesian-inference",
        name: "Bayesian Inference",
        tags: ["Statistics", "Probability", "Data Science"],
        description:
          "A framework for updating beliefs about unknown quantities by combining prior assumptions with observed evidence through probability.",
        importance:
          "Bayesian inference gives data analysis and machine learning a principled way to express uncertainty, compare models, and incorporate prior knowledge.",
        references: [
          {
            title: "Bayesian Data Analysis",
            url: "http://www.stat.columbia.edu/~gelman/book/",
            type: "Book"
          }
        ],
        status: "reviewed"
      },
      {
        id: "unsupervised-learning",
        name: "Unsupervised Learning",
        tags: ["Machine Learning", "Data Science"],
        description:
          "A learning setting where algorithms search for structure, patterns, clusters, or compressed representations in data without explicit target labels.",
        importance:
          "Unsupervised learning helps explore datasets, reduce dimensionality, discover groups, and build representations when labeled data is scarce.",
        references: [
          {
            title: "The Elements of Statistical Learning",
            url: "https://hastie.su.domains/ElemStatLearn/",
            type: "Book"
          }
        ],
        status: "reviewed"
      },
      {
        id: "reinforcement-learning",
        name: "Reinforcement Learning",
        tags: ["Machine Learning", "Decision Making", "Optimization"],
        description:
          "A learning framework where agents choose actions through interaction with an environment and improve behavior using rewards or costs.",
        importance:
          "Reinforcement learning connects machine learning to control, planning, robotics, games, and sequential decision-making under uncertainty.",
        references: [
          {
            title: "Reinforcement Learning: An Introduction",
            url: "http://incompleteideas.net/book/the-book-2nd.html",
            type: "Book"
          }
        ],
        status: "reviewed"
      },
      {
        id: "ensemble-methods",
        name: "Ensemble Methods",
        tags: ["Machine Learning", "Algorithm"],
        description:
          "Methods that combine multiple models so their collective predictions are more accurate, stable, or robust than a single model alone.",
        importance:
          "Ensembles such as random forests and boosting are practical workhorses for tabular data and demonstrate how weak models can form strong systems.",
        references: [
          {
            title: "scikit-learn Ensemble Methods",
            url: "https://scikit-learn.org/stable/modules/ensemble.html",
            type: "Documentation"
          }
        ],
        status: "reviewed"
      },
      {
        id: "representation-learning",
        name: "Representation Learning",
        tags: ["Machine Learning", "Deep Learning"],
        description:
          "Approaches that learn useful features or internal encodings from data instead of relying entirely on manually designed representations.",
        importance:
          "Representation learning reduces the need for hand-crafted features and is a major reason neural networks can adapt across vision, language, and science tasks.",
        references: [
          {
            title: "Representation Learning: A Review and New Perspectives",
            url: "https://arxiv.org/abs/1206.5538",
            type: "Review"
          }
        ],
        status: "reviewed"
      },
      {
        id: "deep-learning",
        name: "Deep Learning",
        tags: ["Machine Learning", "Deep Learning"],
        description:
          "A family of machine learning methods based on neural networks with many layers that learn hierarchical representations from data.",
        importance:
          "Deep learning transformed computer vision, speech recognition, natural language processing, robotics, and scientific modeling through scalable representation learning.",
        references: [
          {
            title: "Deep Learning",
            url: "https://www.deeplearningbook.org/",
            type: "Book"
          }
        ],
        status: "reviewed"
      },
      {
        id: "transformers",
        name: "Transformers",
        tags: ["Machine Learning", "Deep Learning", "Natural Language Processing"],
        description:
          "Neural network architectures built around attention mechanisms that model relationships among tokens or other sequence elements.",
        importance:
          "Transformers became the dominant architecture for large language models and many multimodal systems because they scale well with data and compute.",
        references: [
          {
            title: "Attention Is All You Need",
            url: "https://arxiv.org/abs/1706.03762",
            type: "Paper"
          }
        ],
        status: "reviewed"
      },
      {
        id: "large-language-models",
        name: "Large Language Models",
        tags: ["Machine Learning", "Natural Language Processing", "Technology"],
        description:
          "Large neural language models trained on massive text or multimodal corpora to predict, generate, transform, and reason over sequences.",
        importance:
          "Large language models are a major modern technology platform for search, coding, writing, education, scientific assistance, and human-computer interaction.",
        references: [
          {
            title: "Language Models are Few-Shot Learners",
            url: "https://arxiv.org/abs/2005.14165",
            type: "Paper"
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
        source: "discrete-mathematics",
        target: "graph-theory",
        type: "prerequisite",
        note: "Graph theory builds on discrete structures, relations, and proof techniques."
      },
      {
        source: "discrete-mathematics",
        target: "algorithms",
        type: "prerequisite",
        note: "Algorithm analysis often uses discrete structures, counting, logic, and proof."
      },
      {
        source: "data-structures",
        target: "algorithms",
        type: "prerequisite",
        note: "Efficient algorithms depend on data representations suited to their operations."
      },
      {
        source: "algorithms",
        target: "gradient-descent",
        type: "prerequisite",
        note: "Gradient descent is an iterative algorithm with update rules and convergence behavior."
      },
      {
        source: "graph-theory",
        target: "decision-trees",
        type: "prerequisite",
        note: "Decision trees use graph-shaped structures with branching paths from root to leaves."
      },
      {
        source: "algorithms",
        target: "programming-languages",
        type: "influence",
        note: "Algorithmic needs shape language features for control flow, abstraction, and data manipulation."
      },
      {
        source: "computer-architecture",
        target: "parallel-computing",
        type: "prerequisite",
        note: "Parallel programs depend on hardware organization, memory systems, and processing units."
      },
      {
        source: "parallel-computing",
        target: "gpu-computing",
        type: "prerequisite",
        note: "GPU computing is a specialized form of massively parallel computation."
      },
      {
        source: "gpu-computing",
        target: "deep-learning",
        type: "application",
        note: "GPU acceleration makes large tensor operations and deep learning training practical."
      },
      {
        source: "probability-theory",
        target: "information-theory",
        type: "prerequisite",
        note: "Entropy, coding, and channel models are defined with probabilistic concepts."
      },
      {
        source: "calculus",
        target: "numerical-methods",
        type: "prerequisite",
        note: "Numerical methods approximate derivatives, integrals, and continuous systems."
      },
      {
        source: "linear-algebra",
        target: "numerical-methods",
        type: "prerequisite",
        note: "Many numerical methods operate on matrices, vectors, and linear systems."
      },
      {
        source: "calculus",
        target: "automatic-differentiation",
        type: "prerequisite",
        note: "Automatic differentiation computes derivatives by applying calculus rules to programs."
      },
      {
        source: "automatic-differentiation",
        target: "backpropagation",
        type: "application",
        note: "Backpropagation can be understood as reverse-mode automatic differentiation through layered models."
      },
      {
        source: "linear-algebra",
        target: "linear-regression",
        type: "prerequisite",
        note: "Linear regression is commonly expressed with vectors, matrices, and linear systems."
      },
      {
        source: "statistics",
        target: "linear-regression",
        type: "prerequisite",
        note: "Fitting and evaluating linear regression models uses statistical estimation and uncertainty."
      },
      {
        source: "linear-regression",
        target: "supervised-learning",
        type: "application",
        note: "Linear regression is a canonical supervised learning method for numeric prediction."
      },
      {
        source: "probability-theory",
        target: "bayesian-inference",
        type: "prerequisite",
        note: "Bayesian inference updates probability distributions using observed evidence."
      },
      {
        source: "statistics",
        target: "bayesian-inference",
        type: "prerequisite",
        note: "Bayesian inference is a statistical framework for estimation and model comparison."
      },
      {
        source: "statistics",
        target: "unsupervised-learning",
        type: "prerequisite",
        note: "Unsupervised methods use statistical structure, variation, and distributional assumptions."
      },
      {
        source: "linear-algebra",
        target: "unsupervised-learning",
        type: "prerequisite",
        note: "Clustering, embedding, and dimensionality reduction often depend on vector spaces."
      },
      {
        source: "probability-theory",
        target: "reinforcement-learning",
        type: "prerequisite",
        note: "Reinforcement learning models uncertain outcomes, transitions, and expected returns."
      },
      {
        source: "optimization",
        target: "reinforcement-learning",
        type: "prerequisite",
        note: "Reinforcement learning searches for policies that optimize long-term reward."
      },
      {
        source: "supervised-learning",
        target: "ensemble-methods",
        type: "prerequisite",
        note: "Many ensemble methods combine supervised models to improve prediction."
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
      },
      {
        source: "representation-learning",
        target: "deep-learning",
        type: "influence",
        note: "The goal of learning useful representations shaped many deep learning architectures."
      },
      {
        source: "deep-learning",
        target: "transformers",
        type: "prerequisite",
        note: "Transformers are deep neural architectures built from trainable layers."
      },
      {
        source: "linear-algebra",
        target: "transformers",
        type: "prerequisite",
        note: "Transformer attention and feed-forward blocks rely on vector and matrix operations."
      },
      {
        source: "transformers",
        target: "large-language-models",
        type: "prerequisite",
        note: "Most modern large language models are built on transformer architectures."
      },
      {
        source: "deep-learning",
        target: "large-language-models",
        type: "prerequisite",
        note: "Large language models scale deep learning methods to large text and multimodal corpora."
      },
      {
        source: "information-theory",
        target: "large-language-models",
        type: "influence",
        note: "Language modeling uses ideas related to entropy, prediction, compression, and uncertainty."
      }
    ]
  };
});
