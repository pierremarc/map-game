# maplog

_Maplog_ est un outil de cartographie collaborative et d'annotation territoriale à l'aide de pictogrammes personnalisables.

_Maplog_ c'est comme un pad de la cartographie, une carte qui peut être annotée avec des pictogrammes et des mots de manière collaborative, en ligne et en temps réel. Les données (points+texte) peuvent ensuite être exportées en _.geojson_.

La couche d'annotation produite dans maplog peut être connectée à [_cartofixer_](https://cartofixer.be) par la suite.

# Rejoindre une carte d'annotations

**Créer une carte**

La page d'accueil permet de créer ou de rejoindre une carte déjà existante. Pour créer une carte, il suffit de taper un nom pour la nouvelle carte et de cliquer sur `join`.

**Rejoindre une carte**

Pour rejoindre une carte, il faut connaître le nom de la carte, l'introduire et cliquer sur `join`

# Remplir la carte

La carte peut être utilisée en temps réel par plusieurs utilisateur·trices. Vous verrez apparaître les curseurs des autres participant·es.

## Créer un nouvel autocollant

Pour ajouter un autocollant, il faut uploader une image (.png, .jpg, .svg) dans le panneau de gauche, lui donner un nom, et sauver. Vous avez un nouvel autocollant!

L'autocollant prend une taille de 32x32px par défaut.

## Coller un autocollant sur la carte

Pour ajouter des points, sélectionnez un autocollant (il clignote quand il est sélectionné) et cliquez sur la carte à l'endroit où vous voulez le coller.

Une fois collés, il est difficile de décoller les autocollants.

## Commenter un point

Pour commenter un autocollant, annoter un point sur la carte, sélectionnez le point (il clignote), et ajoutez un commentaire dans le cadre de droite.

Les commentaires sont toujours reliés aux points. Si vous sélectionnez un commentaire, vous verrez que le point auquel il se ratache clignote sur la carte.

# Les données

## Accéder aux données de la carte

Les données de la carte d'annotations sont disponibles en _.geojson_

Pour les télécharger, cliquez sur le bouton "download map data" en haut à droite.

En ajoutant l'extension ".geojson" à l'URL de la carte, les données sont accessibles en ligne (utile pour la réutilisation dans cartofixer, par exemple).

## Publier les données, en faire des cartes de visualisation

Vous pouvez publier vos données par vos propres moyen, ou nous contacter si vous souhaitez que nous rendions disponibles les données de votre carte d'annotation sur [_cartofixer_](https://cartofixer.be).

Cette opération vous permettra de créer une carte en ligne dédiée à la visualisation, que vous pouvez intégrer à votre site web, et qui sera connectée aux données de vos annotations sur _maplog_.

Cette carte de visualisation sera automatiquement mise à jour si des données sont ajoutées via _maplog_, et peut être composée d'autres couches de données, venant de _maplog_ ou d'autres sources de données.

## Confidentialité

Il n'y a pas besoin de compte pour utiliser _maplog_, c'est donc très simple et anonyme : il suffit de connaitre l'adresse d'une carte pour y participer. Ce qui implique que les cartes ne sont pas _privées_ à proprement parler. Cependant, selon l'adresse de votre carte elle sera plus ou moins discrète.

Si vous souhaitez un haut niveau de discrétion, utilisez un nom de carte complexe.

## Conservation

_maplog_ est en version _alpha_, et si l'application est fonctionnelle elle n'en demeure pas moins fragile et sujette à de potentiels développements importants. Dans tous les cas nous ferons notre possible pour conserver les données présentes, mais n'offrons pas de granties à ce sujet.

Nous vous invitons donc à sauvegarder les données de vos annotations si elles sont importantes pour vous.

## Suppression

Dans l'état actuel de _maplog_ nous devons supprimer manuelement les données d'une carte d'annotations lorsque cela nous est demandé. Ce n'est ni long ni complexe, mais nous n'avons pas d'interface disponible pour cela.

Si pour une raison ou une autre vous souhaitez que nous vidions une carte de ses données, contactez-nous.
