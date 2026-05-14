type Rating = {
  rating_id: number;
  rating_score: number;
  rated_at: string;
  anime: { title: string };
  user: { username: string };
};

type RatingsSectionProps = {
  ratings: Rating[];
};

export default function RatingsSection({ ratings }: RatingsSectionProps) {
  return (
    <div style={{ backgroundColor: "#1f2937", padding: "2rem", borderRadius: "12px" }}>
      <h2>Ratings Section</h2>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Anime</th>
            <th>User</th>
            <th>Rating</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {ratings.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: "1rem", textAlign: "center" }}>
                No ratings found.
              </td>
            </tr>
          ) : (
            ratings.map((rating) => (
              <tr key={rating.rating_id}>
                <td style={{ padding: "0.75rem", textAlign: "center" }}>{rating.anime.title}</td>
                <td style={{ padding: "0.75rem", textAlign: "center" }}>{rating.user.username}</td>
                <td style={{ padding: "0.75rem", textAlign: "center" }}>{rating.rating_score}/5</td>
                <td style={{ padding: "0.75rem", textAlign: "center" }}>
                  {new Date(rating.rated_at).toLocaleDateString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
