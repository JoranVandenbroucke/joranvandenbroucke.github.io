---
title: 'AI Programming'
subTitle: 'AI Programming'
description: 'We had a character that had to survive as long as possible in a zombie apocalypse. We programmed the ai to run from house to house and see if an item lies within it. If the ai found an item, it would pick it up, validate how useful it is and take action accordingly.<br/><br/> In this project, i used c++17.'
pubDate: !!str 2022-02-12
image:
  url: '/assets/img/projects/AIProgramming.png'
  alt: ';('
author: 'Joran Vandenbroucke'
authorPP: '/assets/img/ProfilePicture.png'
tags: [ "Game AI", "Game", "AI", "Nav Mesh", "NavMesh", "Navigation Mesh", "DAE" ]
carouselImages: [
  "/assets/img/projects/AI%20programming/0_GPP_TEST_RELEASE.jpg",
  "/assets/img/projects/AI%20programming/1_GPP_TEST_RELEASE.jpg",
  "/assets/img/projects/AI%20programming/2_GPP_TEST_RELEASE.jpg",
  "/assets/img/projects/AI%20programming/3_GPP_TEST_RELEASE.jpg",
  "/assets/img/projects/AI%20programming/4_GPP_TEST_RELEASE.jpg",
  "/assets/img/projects/AI%20programming/5_GPP_TEST_RELEASE.jpg",
  "/assets/img/projects/AI%20programming/6_GPP_TEST_RELEASE.jpg"
]
---
### About

This AI programming is a second-year Game Developer assignment
where each student makes their agent that survives a zombie apocalypse using Visual Studio,
C++.
The assignment said that we had to write code that prolongs the lifespan of the agent.
We only knew the location of a zombies that are in our field of view, the location of items in our fov,
the type of item when we try to grab it.
It is within view and grabbing range, and we had access to navmesh.

The teachers wanted us to delve into AI-related topics that we haven’t seen in class.
So I looked into neural networking and tried to make a network that predicts where the zombies were going.
It was surprisingly accurate for the size of my net, until the player started to walk around.

### Neural net loop

In this code block, the code looks where the zombie was previous frame, using a buffer.
Then, by using the current zombies position, the zombies old position, players position,
player’s velocity, and delta time in an std::vector and gave it to the neural net.
Following that, result position afterward corrected by the actual position.
```cpp
//m_pNet is my neural net of with the following layout 9-8-8-8-2
std::vector>::iterator it1;
it1 = std::find_if( m_KnownZombieBuffer.begin(), m_KnownZombieBuffer.end(), [&entity]( const std::pair& E1 )
{
return E1.first.EntityHash == entity.EntityHash;
} );
m_KnownZombie.push_back( { entity, 3.f } );     //3.0f is remembering the zombies for 3 seconds, than position can be off
if( it1 != m_KnownZombieBuffer.end() )
{
std::vector values{
m_KnownZombie.back().first.Location.x,
m_KnownZombie.back().first.Location.y,
( *it1 ).first.Location.x,
( *it1 ).first.Location.y,
m_LastAgentInfo.Position.x, m_LastAgentInfo.Position.y,
m_LastAgentInfo.LinearVelocity.x,
m_LastAgentInfo.LinearVelocity.y,
dt };
std::vector targetValues{ entity.Location.x, entiy.Location.y };
std::vector result{};
m_pNet->FeedForward( values );
m_pNet->GetResults( result );
m_pNet->BackProp( targetValues );
std::cout << "Net error: " << std::fixed << std::setprecision( 3 ) << m_pNet->GetRecentAverageError() << '\n';
m_GuessPositions.push_back( { { result[0], result[1] } , 3.f } );
}
```