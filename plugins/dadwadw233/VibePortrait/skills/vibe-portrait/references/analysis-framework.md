# Analysis Framework

Extract signals from the user's conversation history across six dimensions. For each dimension, look for the specific patterns described below.

## Dimension 1: Communication Style

**What to measure:**
- **Language distribution**: percentage of messages in Chinese / English / other languages, and whether they code-switch within messages
- **Directness level** (0-100): ratio of imperative commands ("fix this", "do that") vs explanatory/conversational messages
- **Emotional vocabulary**: count of strong emotional markers (exclamation marks, intensifiers like "absolutely", frustration markers like "why isn't this working")
- **Verbosity**: average message length in characters
- **Question-to-statement ratio**: how often they ask vs tell

**Key signals:**
- High directness + short messages = command-oriented communicator
- Long messages + many questions = collaborative/exploratory communicator
- Bilingual with technical English = likely non-native English speaker with deep technical knowledge
- Frequent emotional markers = passionate engagement (not necessarily negative)

## Dimension 2: Technical Breadth

**What to measure:**
- **Domain count**: distinct technical domains mentioned (web, ML/AI, 3D/graphics, systems/infra, mobile, data, security, etc.)
- **Tool/framework diversity**: unique tools, frameworks, and languages referenced
- **Cross-domain connections**: instances where they connect knowledge across domains

**Key signals:**
- 4+ distinct domains = polymath builder
- 2-3 domains = focused specialist with some breadth
- 1 domain = deep specialist
- Cross-domain references = systems-level thinker

**Domain classification:**
- **Web**: React, Vue, Next.js, CSS, HTML, frontend, backend, REST, GraphQL
- **ML/AI**: PyTorch, TensorFlow, training, model, GPU, CUDA, quantization, inference
- **3D/Graphics**: Three.js, Gaussian Splatting, NeRF, SLAM, depth, point cloud, mesh
- **Systems/Infra**: Docker, Kubernetes, CI/CD, deployment, Linux, networking, database
- **Agent/LLM**: prompt, agent, tool calling, RAG, memory, context window, harness
- **Mobile**: iOS, Android, React Native, Flutter
- **Data**: SQL, pandas, analytics, visualization, ETL
- **Embedded/Robotics**: ROS, sensor, navigation, hardware, firmware

## Dimension 3: Technical Depth

**What to measure:**
- **Abstraction level** (0-100): ratio of architecture/design discussions vs implementation/how-to questions
- **Problem complexity**: evidence of multi-step reasoning, system design, trade-off analysis
- **Debugging sophistication**: do they provide error messages, stack traces, and hypotheses, or just "it doesn't work"?
- **Original system building**: evidence of creating novel systems rather than using off-the-shelf solutions

**Key signals:**
- Discusses trade-offs and alternatives = architecture-level thinker
- Provides detailed error context + hypotheses = strong debugger
- Creates custom frameworks/tools = builder mentality
- Asks "how to install X" predominantly = beginner level

## Dimension 4: Decision Patterns

**What to measure:**
- **Pivot speed**: how quickly they abandon an approach that isn't working (look for "never mind", "let's try something else", "revert")
- **Persistence**: how many times they retry or push through on a failing approach
- **Evidence-based decisions**: do they ask for data/proof before deciding?
- **Sunk cost resistance**: willingness to throw away work that doesn't meet standards
- **Delegation clarity**: how precisely they specify what they want done

**Key signals:**
- Fast pivots + no sunk cost attachment = pragmatic decision maker
- Requests data/metrics before green-lighting = evidence-based thinker
- "Just do it" style = action-oriented, trusts AI execution
- Detailed specs before starting = planner mentality

## Dimension 5: Collaboration Style

**What to measure:**
- **Trust level** (0-100): how much they verify AI output vs accepting it at face value
- **Feedback granularity**: do they give specific corrections or vague "this is wrong"?
- **Praise frequency**: how often they acknowledge good work
- **Autonomy expectation**: do they want step-by-step approval or "just get it done"?
- **Teaching vs directing**: do they explain why something should be a certain way, or just say what they want?

**Key signals:**
- Frequent verification + specific corrections = quality-focused collaborator
- Rare praise + high standards = demanding but clear
- "Just get it done" + minimal check-ins = high-trust delegator
- Explains reasoning behind requests = teacher mentality

## Dimension 6: Work Rhythm

**What to measure:**
- **Session patterns**: look at timestamp gaps to infer session boundaries
- **Time-of-day preferences**: which hours are most active (if timestamps available)
- **Task switching frequency**: how often they jump between unrelated topics within a session
- **Sprint vs marathon**: short intense bursts or long sustained sessions
- **Project diversity**: how many distinct projects they work on (look for directory paths, project names)

**Key signals:**
- Late night activity = night owl builder
- Rapid topic switching = multi-project juggler
- Long focused sessions = deep work practitioner
- Many distinct projects = portfolio builder

## Scoring

For each dimension, produce:
1. A **score** (0-100) representing strength/intensity
2. A **one-line summary** describing the user's pattern
3. **2-3 evidence quotes** from their actual messages (keep quotes under 100 characters, anonymize sensitive content like API keys or URLs)

## Confidence Level

Based on message count:
- **< 20 messages**: "Insufficient data" — do not generate portrait
- **20-50 messages**: "Early sketch" — wider uncertainty, note this in the output
- **50-200 messages**: "Clear portrait" — standard confidence
- **200+ messages**: "Deep portrait" — high confidence, can detect personality evolution
