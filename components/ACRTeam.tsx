"use client"
import useSWR from "swr";
import TeamCard from "./TeamCard";
import Heading from "./shared/Headings";
import { requestAxios } from "@/api";
import { ACRTeamObject } from "@/interface";


async function fetcher(url: string) {
    const response = await requestAxios.get(url);
    return response.data.data;
}


const ACRTeam = () => {
    const { data: acrTeam, error, isLoading } = useSWR<ACRTeamObject[]>("/team-info", fetcher);

    return (
        <section className="py-16 bg-background">
            <Heading title="Meet Our Team" subtitle="Our team of professionals is ready to help you with all your accounting needs." />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-24">
                {!isLoading && !error && acrTeam?.map((person, index) => {
                    return (
                        <TeamCard
                            key={index}
                            name={`${person.first_name} ${person.last_name}`}
                            tel={person.tel}
                            email={person.email}
                            title={person.position}
                            bio={person.description}
                            avatar={person.image_url as string}
                            social={{
                                linkedin: person.linkedin_url,
                                instagram: person.instagram_url,
                                twitter: person.twitter_url
                            }}
                        />

                    )
                })
                }
            </div>
        </section>
    )
}
export default ACRTeam;


