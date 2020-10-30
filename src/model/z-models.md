# Models info

To get high level information you can visit [concepts page](https://ractive.js.org/concepts/#models)

## Hierarchy

```text
KeyModel

ModelBase
|
|__ LinkModel
|   |
|   |__ ReferenceExpressionProxy
|
|__ Model
   |
   |__ ExpressionProxy
   |
   |__ RootModel
   |
   |__ ComputationChild
   |
   |__ Computation
   |
   |__ SharedModel
      |
      |__ CSSModel
      |
      |__ RactiveModel
```

## Model deps (ModelBase#deps)

`Object` should be a structure like this `{ rebind: ModelBase['rebind']; handleChange: () => void }`.
That object is created by ReferenceExpressionProxy.

```json
{
  "Model": [
    "Interpolator",
    "Section",
    "ExpressionProxy",
    "Partial",
    "Triple",
    "Object",
    "Computation",
    "Observer",
    "PatternObserver",
    "ArrayObserver"
  ],
  "ExpressionProxy": [
    "Interpolator",
    "Section",
    "ExpressionProxy",
    "Decorator",
    "Object",
    "Partial",
    "Triple"
  ],
  "LinkModel": [
    "Interpolator",
    "Section",
    "ExpressionProxy",
    "Object",
    "Observer",
    "Computation",
    "Partial",
    "PatternObserver"
  ],
  "ReferenceExpressionProxy": [
    "Interpolator",
    "Section",
    "ExpressionProxy",
    "Partial"
  ],
  "Computation": [
    "Interpolator",
    "Computation",
    "ExpressionProxy",
    "Section",
    "Object",
    "Observer"
  ],
  "RootModel": [
    "ExpressionProxy",
    "PatternObserver",
    "Observer",
    "Object"
  ],
  "ComputationChild": [
    "Interpolator",
    "Section",
    "ExpressionProxy",
    "Partial",
    "Object"
  ],
  "SharedModel": [
    "ExpressionProxy"
  ],
  "RactiveModel": [
    "ExpressionProxy"
  ]
}
```
