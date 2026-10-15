# Third-party anatomy asset notices

Medalicus loads these models from immutable upstream Git revisions at runtime. No copies of these upstream GLB files are committed in this repository. If the remote source is unavailable or a browser cannot fetch it, the viewer should report the asset failure rather than substitute fabricated anatomy.

## BodyParts3D-derived organ atlas

- **Runtime assets:** `anatomy-organs.glb`, `anatomy-skin.glb`
- **Pinned source:** [yamz8/human-body-simulator @ e4d76fbb424d15e1364963528a082a78fa359161](https://github.com/yamz8/human-body-simulator/tree/e4d76fbb424d15e1364963528a082a78fa359161)
- **Upstream asset paths:** [organs](https://github.com/yamz8/human-body-simulator/blob/e4d76fbb424d15e1364963528a082a78fa359161/public/models/anatomy-organs.glb), [skin](https://github.com/yamz8/human-body-simulator/blob/e4d76fbb424d15e1364963528a082a78fa359161/public/models/anatomy-skin.glb)
- **Original model:** BodyParts3D 3.0, © The Database Center for Life Science (DBCLS), Japan. [Original archive DOI](https://doi.org/10.18908/lsdba.nbdc00837-000).
- **License:** [Creative Commons Attribution-ShareAlike 2.1 Japan](https://creativecommons.org/licenses/by-sa/2.1/jp/legalcode).
- **Runtime modifications:** Materials are recolored for visualization; semantic organ nodes are regrouped into application layers; the skin mesh is translated into the viewer's scene coordinate frame.

## Open3Dmodel / Open Anatomy skeleton

- **Runtime asset:** `overview-skeleton.glb`
- **Pinned source:** [yamz8/human-body-simulator @ e4d76fbb424d15e1364963528a082a78fa359161](https://github.com/yamz8/human-body-simulator/tree/e4d76fbb424d15e1364963528a082a78fa359161)
- **Upstream asset path:** [overview-skeleton.glb](https://github.com/yamz8/human-body-simulator/blob/e4d76fbb424d15e1364963528a082a78fa359161/public/models/overview-skeleton.glb)
- **Attribution/source:** Open3Dmodel contributors / Open Anatomy lineage. [Source project](https://anatomytool.org/open3dmodel-create).
- **License:** [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/legalcode).
- **Runtime modifications:** Meshes are scaled and positioned to align with the body atlas; some paired structures whose source names end in `.r` are mirrored to create a left counterpart; region views filter the named structures; mesh materials are adapted for display.

## Human Reference Atlas layered eye

- **Runtime asset:** `eye-anatomy.glb`
- **Pinned source:** [huahbo/ocularium @ f8e64d76e08aa4bbae91cd86cd4ec13e2ad5a10c](https://github.com/huahbo/ocularium/tree/f8e64d76e08aa4bbae91cd86cd4ec13e2ad5a10c)
- **Upstream asset path:** [eye-anatomy.glb](https://github.com/huahbo/ocularium/blob/f8e64d76e08aa4bbae91cd86cd4ec13e2ad5a10c/public/models/eye-anatomy.glb)
- **Original source:** Human Reference Atlas 3D Reference Object Library / US National Library of Medicine Visible Human Project. [Reference library](https://humanatlas.io/3d-reference-library).
- **License:** [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).
- **Runtime modifications:** The mesh group is normalized and centered to fit the viewer; materials are cloned so display opacity can be changed without mutating the cached source scene.
- **Additional upstream project acknowledgement:** Ocularium grew out of the MIT-licensed [thebuggeddev/anatomy](https://github.com/thebuggeddev/anatomy) project; that code attribution does not replace the separate model/texture licenses.

## Scope and limitations

This integration covers the structures listed in the README table, not a complete digital human atlas. In particular, no fetal/gravid-uterus model has been integrated, the eye model does not provide ENT anatomy, and the imported organ meshes are not patient-specific CT/MRI data. The camera's axial/coronal/sagittal presets are viewing directions, not true multiplanar reconstructions. Do not use these teaching models for diagnosis, intervention planning, or clinical decision-making.

Before redistributing any anatomy asset or a modified asset file, read the linked legal code and satisfy that asset's attribution and ShareAlike requirements.
