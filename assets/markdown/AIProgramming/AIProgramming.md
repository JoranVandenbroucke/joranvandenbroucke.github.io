## Explanation

This AI programming is a 2nd-year Game Developer assignment where each student makes their agent that survives a zombie apocalypse using Visual Studio, C++. The assignment said that we had to write code that prolongs the lifespan of the agent. We only knew the location of a zombies that are in our field of view, the location of items in our fov, the type of item when we try to grab it and it is within view and grabbing range and we had access to navmesh.

The teachers wanted us to delve into AI-related topics that we haven`t seen in class. So I looked into neural networking and tried to make a network that predicts where the zombies were going. It was surprisingly accurate for the size of my net, until the player started to walk around.

## Neural net loop

In this code block I look where the zombie was previous frame, using my buffer. Than I put zombies postionn, zombies old position, players postion, players velocity and delta time in an std::vector and gave it to the neural net. Following that I got the result position afterwarts I corrected it with the correct position.
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